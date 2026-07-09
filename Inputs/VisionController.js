import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/vision_bundle.mjs";
import { whichLetterIsDetected } from '../Utils/LsfDictionary.js';

export class VisionController {
    // On passe la vidéo et le canvas en paramètres pour ne pas chercher dans le document HTML
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.gestureRecognizer = null;
        this.lastVideoTime = -1;
        this.webcamRunning = false;

        // L'état propre de la vision à l'instant T
        this.currentGestures = [];
    }

    async init() {
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
            console.log("VisionController : MediaPipe est prêt !");
            return true; // Indique que tout s'est bien passé
        } catch (error) {
            console.error("Erreur d'initialisation MediaPipe :", error);
            return false;
        }
    }

    toggleWebcam() {
        if (this.webcamRunning) {
            this.webcamRunning = false;
            if (this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(track => track.stop());
                this.video.srcObject = null;
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                this.video.srcObject = stream;
                this.video.addEventListener("loadeddata", () => {
                    this.video.play();
                    this.webcamRunning = true;
                }, { once: true });
            }).catch(err => {
                console.error("Impossible d'accéder à la webcam.", err);
                this.webcamRunning = false;
            });
        }
    }

    // Cette fonction sera appelée en boucle par le GameEngine
    update() {
        // On vide la liste des gestes à chaque nouvelle image
        this.currentGestures = [];

        if (this.webcamRunning && this.video.currentTime !== this.lastVideoTime && this.video.videoWidth > 0 && this.gestureRecognizer) {
            this.lastVideoTime = this.video.currentTime;
            let nowInMs = Math.round(this.video.currentTime * 1000);

            // Dessin de la vidéo en fond
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            const results = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs);
            const drawingUtils = new DrawingUtils(this.ctx);

            this.drawMediapipeHandsOverlay(nowInMs, results, drawingUtils);
            this.detectingGestures(results, drawingUtils);

        }
    }

    detectingGestures(results, drawingUtils) {

        if (results.landmarks) {
            for (let i = 0; i < results.landmarks.length; i++) {
                const landmarks = results.landmarks[i];
                const letterDetected = whichLetterIsDetected(landmarks);
                if (!(letterDetected === "")) { //if we find at least one letter
                    this.currentGestures.push(letterDetected);
                }
            }
        }
    }

    drawMediapipeHandsOverlay(nowInMs, results, drawingUtils) {

        if (results.landmarks) {
            // old code used to draw the ligne and points on hands detected by mediapipe
            for (const landmarks of results.landmarks) {
                drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 3 });
                drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
            }
        }
    }

    // Le InputManager utilisera cette méthode pour récupérer les données
    getGestures() {
        return this.currentGestures;
    }
}