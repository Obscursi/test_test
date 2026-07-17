import { whichLetterIsDetected } from '../../Utils/LsfDictionary.js';
import { initMediapipe, DrawingUtils, GestureRecognizer } from '../../Utils/Libraries/LoadMediapipe.js';

export class LsfRecognizer {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.gestureRecognizer = null;
        this.lastVideoTime = -1;

        //this.loadMediapipe = new LoadMediapipe();
    }

    async initLsf() {
        this.gestureRecognizer = await initMediapipe();

        return (this.gestureRecognizer !== null);
    }

    updateLsf(currentGestures, webcamRunning) {
        // On vide la liste des gestes à chaque nouvelle image
        currentGestures.length = 0;

        if (webcamRunning && this.video.currentTime !== this.lastVideoTime && this.video.videoWidth > 0 && this.gestureRecognizer) {
            this.lastVideoTime = this.video.currentTime;
            let nowInMs = Math.round(this.video.currentTime * 1000);

            // Dessin de la vidéo en fond
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            const results = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs);
            const drawingUtils = new DrawingUtils(this.ctx);

            this.drawMediapipeHandsOverlay(results, drawingUtils);
            this.detectingGestures(results, currentGestures);

        }
    }

    detectingGestures(results, currentGestures) {

        if (results.landmarks) {
            for (let i = 0; i < results.landmarks.length; i++) {
                const landmarks = results.landmarks[i];
                const letterDetected = whichLetterIsDetected(landmarks);
                if (!(letterDetected === "")) { //if we find at least one letter
                    currentGestures.push(letterDetected);
                }
            }
        }
    }

    drawMediapipeHandsOverlay(results, drawingUtils) {

        if (results.landmarks) {
            // old code used to draw the ligne and points on hands detected by mediapipe
            for (const landmarks of results.landmarks) {
                drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 3 });
                drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
            }
        }
    }
}
