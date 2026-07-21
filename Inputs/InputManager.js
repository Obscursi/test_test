import { VisionController } from './Controller/VisionController.js';
import { KeyboardController } from './Controller/KeyboardController.js';

// import { KeyboardController } from './KeyboardController.js'; // Prévu pour plus tard

class InputManager {
    constructor() {
        // On récupère les éléments HTML ici pour les donner à la Vision
        const videoElement = document.getElementById("webcam");
        const canvasElement = document.getElementById("mp_canvas");

        this.vision = new VisionController(videoElement, canvasElement);
        this.keyboard = new KeyboardController();
        // this.keyboard = new KeyboardController();
    }

    // Démarre tous les capteurs
    async init() {
        console.log("InputManager : Lancement des capteurs...");
        const isVisionReady = await this.vision.init();
        // await this.keyboard.init();
        return isVisionReady;
    }

    toggleWebcam() {
        this.vision.toggleWebcam();
    }


    update(tabId) {
        this.vision.update(tabId);
        // this.keyboard.update();
    }

    // LA méthode clé : retourne l'état global du joueur au GameEngine
    getState() {
        return {
            gestures: this.vision.getResults()
            // keys: this.keyboard.getPressedKeys()
        };
    }
}

const inputManagerInstance = new InputManager();
export default inputManagerInstance;