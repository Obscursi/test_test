let cv;

//Every color detected first met thos requirements (if not it is considered as an unknown color)
const MINIMUM_SATURATION = 90;
const MINIMUM_LUMINOSITY = 70;

const SAMPLE_STEP = 2; //we do not take every pixel in the circle of sampling, just half of them
const MINIMUM_VOTES = 3;    //the minimum votes a sample circle needs to have to be detected as known color, should never be useful
// it's a security if the circle is too small (it is used but if we delete it should still work)

//Part of ALL the sampled pixels that must agree, Unknown ones included. 
const MINIMUM_CONSENSUS = 0.5;

export class ColorsRecognizer {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;   // overlay : uniquement les cercles, fond transparent
        this.ctx = this.canvas.getContext("2d");

        this.lastVideoTime = -1;

        // working matrix, allocated by initColors
        this.small = null;
        this.gray = null;
        this.blurred = null;
        this.hsv = null;
        this.circles = null;

        // variables for the webcam lecture, allocated by attachVideoSource
        this.cap = null;
        this.srcMat = null;

        //this.detectedColorsThisFrame = new Set(); not used anymore right now

    }


    async initColors() {
        //we charge openCV from the global variable
        cv = window.cv;

        // Working matrix : OpenCV resizes them by itself, they do not depend on the webcam
        this.small = new cv.Mat();
        this.gray = new cv.Mat();
        this.blurred = new cv.Mat();
        this.hsv = new cv.Mat();
        this.circles = new cv.Mat();

        console.log("📸 ColorsEnigma : OpenCV initialisé.");

        return true;
    }

    /**
     * Called by the VisionController once the webcam actually delivers images.
     *
     * srcMat must have the exact same size as the video, and videoWidth/videoHeight
     * are only known at that moment : at initColors() time they are still 0.
     */
    attachVideoSource() {
        this.cap = new cv.VideoCapture(this.video);
        this.srcMat = new cv.Mat(this.video.videoHeight, this.video.videoWidth, cv.CV_8UC4);
        this.lastVideoTime = -1;

        // L'overlay passe a la resolution reelle du flux : les coordonnees des cercles sont
        // exprimees dans l'espace du Mat, elles tombent donc juste sans mise a l'echelle.
        // Le CSS continue d'afficher le tout en 640x480, aligne sur l'element <video>.
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        console.log(`📸 ColorsEnigma : Capteur vidéo branché en ${this.video.videoWidth}×${this.video.videoHeight}.`);
    }

    /**
     * Called when the webcam stops : the next start may have another resolution
     */
    detachVideoSource() {
        if (this.srcMat) {
            this.srcMat.delete();
            this.srcMat = null;
        }
        this.cap = null;
        this.lastVideoTime = -1;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    updateColors(currentResults, webcamRunning) {

        //if the webcam is not running || the source is not plugged yet || the image is not new
        if (!webcamRunning || !this.cap || this.video.currentTime === this.lastVideoTime) {
            return; //we discard it silently
        }

        this.lastVideoTime = this.video.currentTime;

        // Le flux webcam est affiché nativement par l'élément <video> placé en dessous :
        // il n'y a rien à dessiner pour lui. On ne s'occupe que de l'overlay, remis à vide.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        try {
            // Lecture de l'image
            this.cap.read(this.srcMat);

            // Analyse : la detection ne dessine rien, elle rend ce qu'elle a trouve
            const { colorsDetected, circlesDetected } = this.detectColoredCircles(this.srcMat);

            // Affichage : l'overlay est construit a partir du resultat de la detection
            this.drawCirclesOverlay(circlesDetected);

            currentResults.colors = colorsDetected; //pushing the result to the VisionController
        } catch (err) {
            console.error("Erreur de traitement OpenCV :", err);
        }
    }

    /**
     * Analyse une image pour trouver des cercles. Ne dessine rien : elle rend seulement ce
     * qu'elle a vu, a charge de l'appelant d'en faire un overlay.
     *
     * @param {cv.Mat} srcMat - L'image source lue depuis la webcam par le VideoCapture.
     * @returns {{colorsDetected: Set<string>, circlesDetected: Array<{x: number, y: number, radius: number}>}}
     */
    detectColoredCircles(srcMat) {
        const colorsDetected = new Set();
        const circlesDetected = [];

        // Une pastille de couleur est une grosse tache : la moitie de la resolution suffit
        // largement, et divise par 4 le cout de toute la chaine qui suit. En 720p l'image
        // reduite fait 640x360, soit l'echelle a laquelle les rayons ci-dessous ont ete regles.
        cv.pyrDown(srcMat, this.small);

        cv.cvtColor(this.small, this.gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(this.gray, this.blurred, new cv.Size(9, 9), 2, 2);

        // Paramètres de détection de cercles
        cv.HoughCircles(this.blurred, this.circles, cv.HOUGH_GRADIENT, 1, 50, 100, 38, 10, 50);

        if (this.circles.cols === 0) return { colorsDetected, circlesDetected };

        cv.cvtColor(this.small, this.hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(this.hsv, this.hsv, cv.COLOR_RGB2HSV);

        for (let i = 0; i < this.circles.cols; ++i) {
            const x = Math.round(this.circles.data32F[i * 3]);
            const y = Math.round(this.circles.data32F[i * 3 + 1]);
            const radius = Math.round(this.circles.data32F[i * 3 + 2]);

            const couleurDetectee = this.identifyColorOfCircle(x, y, radius);

            if (couleurDetectee !== "Unknown") {
                colorsDetected.add(couleurDetectee);
                circlesDetected.push({ x, y, radius });
            }
        }

        return { colorsDetected, circlesDetected };
    }

    /**
     * Builds the overlay from what the detection returned : outline + center dot per circle.
     *
     * Vector drawing on a transparent canvas, so the webcam flux underneath stays untouched.
     *
     * @param {Array<{x: number, y: number, radius: number}>} circlesDetected
     */
    drawCirclesOverlay(circlesDetected) {
        // Les cercles sont exprimes dans l'espace de l'image reduite, l'overlay est a la
        // resolution du flux : on remet a l'echelle plutot que de detecter en pleine taille.
        const scale = this.small.cols > 0 ? this.canvas.width / this.small.cols : 1;

        this.ctx.strokeStyle = "#FF0000";
        this.ctx.lineWidth = 3 * scale;
        this.ctx.fillStyle = "#00FF00";

        for (const { x, y, radius } of circlesDetected) {
            this.ctx.beginPath();
            this.ctx.arc(x * scale, y * scale, radius * scale, 0, 2 * Math.PI);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(x * scale, y * scale, 3 * scale, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    /**
     * Identifies a circle color by looking at a small sample cirecle around the middle of the circle
     *
     * We make each pixel of the sample vote to see which color is detected as the main one => supposedly the color of the circle
     *
     * @returns {string} the name of the color, or "Unknown"
     */
    identifyColorOfCircle(x, y, radius) {
        // On reste bien à l'intérieur du cercle, pour ne jamais mordre sur son contour ni sur le fond
        const radiusOfSample = Math.max(1, Math.round(radius / 3));

        const votes = {};
        let mainColor = "Unknown";
        let bestScore = 0;
        let totalSamples = 0;

        //let sH = 0, sS = 0, sV = 0, n = 0; //to uncomment with the sH+= pixe.. line and the one before thre turn => prints the value of the color detected

        for (let dy = -radiusOfSample; dy <= radiusOfSample; dy += SAMPLE_STEP) {
            for (let dx = -radiusOfSample; dx <= radiusOfSample; dx += SAMPLE_STEP) {
                if (dx * dx + dy * dy > radiusOfSample * radiusOfSample) continue; // on garde un disque, pas un carré

                const px = x + dx;
                const py = y + dy;
                if (px < 0 || py < 0 || px >= this.hsv.cols || py >= this.hsv.rows) continue;

                const pixel = this.hsv.ucharPtr(py, px);
                //sH += pixel[0]; sS += pixel[1]; sV += pixel[2]; n++;

                //Counted BEFORE the Unknown test : an unreadable pixel is a pixel that disagrees,
                //not a pixel that does not exist.
                totalSamples++;

                const colorSeen = this.analyseColorHSV(pixel[0], pixel[1], pixel[2]);

                if (colorSeen === "Unknown") continue;

                votes[colorSeen] = (votes[colorSeen] || 0) + 1;

                if (votes[colorSeen] > bestScore) {
                    bestScore = votes[colorSeen];
                    mainColor = colorSeen;
                }
            }
        }

        if (bestScore < MINIMUM_VOTES) return "Unknown";
        if (bestScore < totalSamples * MINIMUM_CONSENSUS) return "Unknown";

        //if (n && Math.random() < 0.1) console.log(`H=${(sH / n) | 0} S=${(sS / n) | 0} V=${(sV / n) | 0}`);
        return mainColor;
    }

    /**
    * Colors are differentiated by the hue only, not their luminosity or saturation.
    * 
     * @returns {string} the name of the color, or "Unknown"
     */
    analyseColorHSV(h, s, v) {
        //Black is checked FIRST : it has no usable hue, so it would be thrown away
        if (s < MINIMUM_SATURATION || v < MINIMUM_LUMINOSITY) return "Unknown";

        if (h >= 170 || h <= 10) return "Rouge"; //red is between 170 and 10 because H is looping if the value is over 179
        if (h >= 20 && h <= 40) return "Jaune";
        if (h >= 48 && h <= 78) return "Vert";
        if (h >= 83 && h <= 106) return "Cyan"; //la 6e teinte du cube RGB, coincée entre le vert et le bleu
        if (h >= 110 && h <= 133) return "Bleu"; //for both of my test sheets it was around h=110

        //We have kinda restrictive teints because we rather want an unknown vote than a false positive of color
        return "Unknown";
    }

    cleanOfMemory() {
        for (const matrix of [this.small, this.gray, this.blurred, this.hsv, this.circles]) {
            if (matrix) matrix.delete();
        }
        this.small = this.gray = this.blurred = this.hsv = this.circles = null;

        this.detachVideoSource();
    }

}
