import { initOpenCV } from '../../Utils/Libraries/LoadOpenCV.js';


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
                await initOpenCV();
            } catch (error) {
                console.error("🚨 Échec d'OpenCV.", error);
                return;
            }

            console.log("UpdateColors : Colors est prêt !");
            return true; // Indique que tout s'est bien passé
        } catch (error) {
            console.error("Erreur d'initialisation OpenCV :", error);
            return false;
        }
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
