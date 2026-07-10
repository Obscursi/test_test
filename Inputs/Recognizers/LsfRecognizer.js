import { whichLetterIsDetected } from '../../Utils/LsfDictionary.js';

import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/vision_bundle.mjs";

export class LsfRecognizer {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.gestureRecognizer = null;
        this.lastVideoTime = -1;
    }

    async initLsf() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
            );

            this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "CPU"
                },
                runningMode: "VIDEO",
                numHands: 4
            });
            console.log("UpdateLsf : MediaPipe est prêt !");
            return true; // Indique que tout s'est bien passé
        } catch (error) {
            console.error("Erreur d'initialisation MediaPipe :", error);
            return false;
        }
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
