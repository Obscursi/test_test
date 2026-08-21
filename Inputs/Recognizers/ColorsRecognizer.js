
let cv;

//Every color detected first met thos requirements (if not it is considered as an unknown color)
const MINIMUM_SATURATION = 90;
const MINIMUM_LUMINOSITY = 70;

//Black and white have no meaningful hue : they are recognized by their luminosity and saturation only
const MAXIMUM_BLACK_LUMINOSITY = 70;

const SAMPLE_STEP = 2; //we do not take every pixel in the circle of sampling, just half of them
const MINIMUM_VOTES = 3; //the minimum votes a sample circle needs to have to be detected as known color

export class ColorsRecognizer {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.lastVideoTime = -1;

        // Pre-allocation of matrix
        this.gray = null;
        this.blurred = null;
        this.hsv = null;
        this.circles = null;

        // variables for the webcam lecture
        this.cap = null;
        this.srcMat = null;

        this.detectedColorsThisFrame = new Set();


    }





    updateColors(currentResults, webcamRunning) {

        if (webcamRunning && this.video.currentTime !== this.lastVideoTime && this.video.videoWidth > 0) {
            this.lastVideoTime = this.video.currentTime;
            let nowInMs = Math.round(this.video.currentTime * 1000);
            // drawing of the webcam flux on the page
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        }

        if (!this.gray) {

            //we charge openCV from the global variable
            cv = window.cv;

            // allocation of the matrix
            this.gray = new cv.Mat();
            this.blurred = new cv.Mat();
            this.hsv = new cv.Mat();
            this.circles = new cv.Mat();
        }

        // Sécurité : on attend que la webcam soit vraiment allumée
        if (!this.video || this.video.videoWidth === 0 || this.video.videoHeight === 0) return;

        // Initialisation du capteur OpenCV à la première image valide
        if (!this.cap) {
            this.cap = new cv.VideoCapture(this.video);
            this.srcMat = new cv.Mat(this.video.videoHeight, this.video.videoWidth, cv.CV_8UC4);
            console.log("📸 ColorsEnigma : Capteur vidéo OpenCV initialisé.");
            console.log(`🚀 Début de l'énigme !`);
        }

        try {
            // Lecture de l'image
            this.cap.read(this.srcMat);

            // Analyse et récupération des couleurs détectées sur cette frame
            this.detectedColorsThisFrame = this.detectColoredCircles(this.srcMat);

            // Affichage sur le canvas
            cv.imshow(this.canvas, this.srcMat);

            currentResults.colors = this.detectedColorsThisFrame; //pushing the result to the VisionController
        } catch (err) {
            console.error("Erreur de traitement OpenCV :", err);
        }


    }

    /**
 * Analyse une image pour trouver des cercles et retourne un Set des couleurs détectées.
 * @param {cv.Mat} srcMat - L'image source provenant du canvas.
 * @returns {Set<string>} - Set contenant les noms des couleurs identifiées.
 */
    detectColoredCircles(srcMat) {
        const colorsDetected = new Set();

        cv.cvtColor(srcMat, this.gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(this.gray, this.blurred, new cv.Size(9, 9), 2, 2);

        // Paramètres de détection de cercles
        cv.HoughCircles(this.blurred, this.circles, cv.HOUGH_GRADIENT, 1, 50, 100, 38, 10, 50);

        if (this.circles.cols === 0) return colorsDetected;

        cv.cvtColor(srcMat, this.hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(this.hsv, this.hsv, cv.COLOR_RGB2HSV);

        for (let i = 0; i < this.circles.cols; ++i) {
            const x = Math.round(this.circles.data32F[i * 3]);
            const y = Math.round(this.circles.data32F[i * 3 + 1]);
            const radius = Math.round(this.circles.data32F[i * 3 + 2]);

            const couleurDetectee = this.identifyColorOfCircle(x, y, radius);

            if (couleurDetectee !== "Unknown") {
                colorsDetected.add(couleurDetectee);

                // Dessin visuel sur l'image
                cv.circle(srcMat, new cv.Point(x, y), radius, new cv.Scalar(255, 0, 0, 255), 3);
                cv.circle(srcMat, new cv.Point(x, y), 3, new cv.Scalar(0, 255, 0, 255), -1);
            }
        }

        return colorsDetected;
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
        let validVotes = 0;

        for (let dy = -radiusOfSample; dy <= radiusOfSample; dy += SAMPLE_STEP) {
            for (let dx = -radiusOfSample; dx <= radiusOfSample; dx += SAMPLE_STEP) {
                if (dx * dx + dy * dy > radiusOfSample * radiusOfSample) continue; // on garde un disque, pas un carré

                const px = x + dx;
                const py = y + dy;
                if (px < 0 || py < 0 || px >= this.hsv.cols || py >= this.hsv.rows) continue;

                const pixel = this.hsv.ucharPtr(py, px);
                const colorSeen = this.analyseColorHSV(pixel[0], pixel[1], pixel[2]);

                if (colorSeen === "Unknown") continue;

                validVotes++;
                votes[colorSeen] = (votes[colorSeen] || 0) + 1;

                if (votes[colorSeen] > bestScore) {
                    bestScore = votes[colorSeen];
                    mainColor = colorSeen;
                }
            }
        }

        if (bestScore < MINIMUM_VOTES) return "Unknown";
        if (bestScore <= validVotes / 2) return "Unknown";

        return mainColor;
    }

    /**
    * Colors are differentiated by the hue only, not their luminosity or saturation.
    * 
     * @returns {string} the name of the color, or "Unknown"
     */
    analyseColorHSV(h, s, v) {
        //Black is checked FIRST : it has no usable hue, so it would be thrown away
        if (v < MAXIMUM_BLACK_LUMINOSITY) return "Noir";

        if (s < MINIMUM_SATURATION || v < MINIMUM_LUMINOSITY) return "Unknown";

        if (h >= 170 || h <= 10) return "Rouge"; //red is between 170 and 10 because H is looping if the value is over 179
        if (h >= 20 && h <= 40) return "Jaune";
        if (h >= 48 && h <= 78) return "Vert";
        if (h >= 83 && h <= 101) return "Cyan"; //la 6e teinte du cube RGB, coincée entre le vert et le bleu
        if (h >= 105 && h <= 133) return "Bleu";

        //We have kinda restrictive teints because we rather want an unknown vote than a false positive of color
        return "Unknown";
    }

    cleanOfMemory() {
        this.gray.delete();
        this.blurred.delete();
        this.hsv.delete();
        this.circles.delete();

        if (this.srcMat) {
            this.srcMat.delete();
        }
    }

}
