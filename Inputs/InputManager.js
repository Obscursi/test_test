import { VisionController } from './Controller/VisionController.js';
import { KeyboardController } from './Controller/KeyboardController.js';
class InputManager {
    constructor() {
        // On récupère les éléments HTML ici pour les donner à la Vision
        const videoElement = document.getElementById("webcam");
        const canvasElement = document.getElementById("mp_canvas");

        this.vision = new VisionController(videoElement, canvasElement);
        this.keyboard = new KeyboardController();
    }

    // Démarre tous les capteurs
    async init() {
        console.log("InputManager : Lancement des capteurs...");
        const isVisionReady = await this.vision.init();
        return isVisionReady;
    }

    toggleWebcam() {
        this.vision.toggleWebcam();
    }


    update(tabId) {
        this.vision.update(tabId);
    }

    getState() {
        return this.vision.getResults();
    }
}

const inputManagerInstance = new InputManager();
export default inputManagerInstance;