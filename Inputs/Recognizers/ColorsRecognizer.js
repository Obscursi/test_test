export class ColorsRecognizer {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.lastVideoTime = -1;
    }

    async initColors() {
        try {

            try {
                await this.initOpenCV();
            } catch (error) {
                console.error("🚨 Échec d'OpenCV.", error);
                return;
            }

            console.log("UpdateColors : Colors est prêt !");
            return true; // Indique que tout s'est bien passé
        } catch (error) {
            console.error("Erreur d'initialisation MediaPipe :", error);
            return false;
        }
    }

    /**
     * Injecte OpenCV dans la page avec un bouclier anti-conflit pour la mémoire
     */
    async initOpenCV() {
        return new Promise((resolve, reject) => {
            console.log("⏳ Début du téléchargement sécurisé d'OpenCV...");

            if (window.cv && window.cv.Mat) {
                resolve();
                return;
            }

            // ==============================================================
            // LE BOUCLIER : On cache temporairement la mémoire de MediaPipe
            // pour éviter qu'OpenCV ne l'écrase ou s'emmêle les pinceaux.
            // ==============================================================
            const memoireMediaPipe = window.Module;
            window.Module = undefined;

            // On crée l'import dynamiquement
            const script = document.createElement('script');
            script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
            script.type = 'text/javascript';

            script.onload = () => {
                const checkInterval = setInterval(() => {
                    // OpenCV est prêt quand l'objet cv et ses fonctions (Mat) existent
                    if (window.cv && window.cv.Mat) {
                        clearInterval(checkInterval);

                        // On restaure la mémoire de MediaPipe maintenant qu'OpenCV est installé
                        if (memoireMediaPipe !== undefined) {
                            window.Module = memoireMediaPipe;
                        }

                        console.log("👁️ OpenCV est totalement initialisé !");
                        resolve();
                    }
                }, 100);
            };

            script.onerror = () => {
                reject(new Error("Impossible de charger le script OpenCV.js"));
            };

            document.body.appendChild(script);
        });
    }

    updateColors(currentColors, webcamRunning) {
        if (webcamRunning && this.video.currentTime !== this.lastVideoTime && this.video.videoWidth > 0) {
            this.lastVideoTime = this.video.currentTime;
            let nowInMs = Math.round(this.video.currentTime * 1000);

            // Dessin de la vidéo en fond
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        }
    }

}
