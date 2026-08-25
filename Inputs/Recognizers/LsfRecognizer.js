import { whichLetterIsDetected } from '../../Utils/LsfDictionary.js';
import { initMediapipe, DrawingUtils, HandLandmarker } from '../../Utils/LibraryLoading/LoadMediapipe.js';

export class LsfRecognizer {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.handLandmarker = null;
        this.lastVideoTime = -1;
    }

    async initLsf() {
        this.handLandmarker = await initMediapipe();

        return Boolean(this.handLandmarker);
    }

    updateLsf(currentResults, webcamRunning) {
        // On vide la liste des gestes à chaque nouvelle image
        currentResults.gestures.length = 0;

        if (webcamRunning && this.video.currentTime !== this.lastVideoTime && this.video.videoWidth > 0 && this.handLandmarker) {
            this.lastVideoTime = this.video.currentTime;
            let nowInMs = Math.round(this.video.currentTime * 1000);

            // Dessin de la vidéo en fond
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            const results = this.handLandmarker.detectForVideo(this.video, nowInMs);
            const drawingUtils = new DrawingUtils(this.ctx);

            this.drawMediapipeHandsOverlay(results, drawingUtils);
            this.detectingGestures(results, currentResults);

        }
    }

    detectingGestures(results, currentResults) {

        if (results.landmarks) {
            for (let i = 0; i < results.landmarks.length; i++) {
                const landmarks = results.landmarks[i];
                const letterDetected = whichLetterIsDetected(landmarks);
                if (!(letterDetected === "")) { //if we find at least one letter
                    currentResults.gestures.push(letterDetected);
                }
            }
        }
    }

    drawMediapipeHandsOverlay(results, drawingUtils) {

        if (results.landmarks) {
            // old code used to draw the ligne and points on hands detected by mediapipe
            for (const landmarks of results.landmarks) {
                drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 3 });
                drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
            }
        }
    }
}
