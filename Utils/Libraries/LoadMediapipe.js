import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/vision_bundle.mjs";

export { DrawingUtils, GestureRecognizer };

export async function initMediapipe() {
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
        );

        const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                delegate: "CPU"
            },
            runningMode: "VIDEO",
            numHands: 4
        });
        console.log("UpdateLsf : MediaPipe est prêt !");
        return gestureRecognizer; // Indique que tout s'est bien passé
    } catch (error) {
        console.error("Erreur d'initialisation MediaPipe :", error);
        return false;
    }
}
