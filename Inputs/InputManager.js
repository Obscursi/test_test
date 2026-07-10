import { VisionController } from './VisionController.js';
// import { KeyboardController } from './KeyboardController.js'; // Prévu pour plus tard

class InputManager {
    constructor() {
        // On récupère les éléments HTML ici pour les donner à la Vision
        const videoElement = document.getElementById("webcam");
        const canvasElement = document.getElementById("mp_canvas");

        this.vision = new VisionController(videoElement, canvasElement);
        // this.keyboard = new KeyboardController();
    }

    // Démarre tous les capteurs
    async init() {
        console.log("InputManager : Lancement des capteurs...");
        const isVisionReady = await this.vision.init();
        // await this.keyboard.init();
        console.log("InputManager : wow");

        return isVisionReady;
    }

    toggleWebcam() {
        this.vision.toggleWebcam();
    }


    update(tabId) {
        if (tabId === 'lsf') {
            this.vision.updateLsf();
        } else if (tabId === 'colors') {
            this.vision.updateColors();
        } else {
            console.log("DEBUG : Update dasn InputManager n'a pas trouvé le tab correspondant");
        }
        // this.keyboard.update();
    }

    // LA méthode clé : retourne l'état global du joueur au GameEngine
    getState() {
        return {
            gestures: this.vision.getGestures()
            // keys: this.keyboard.getPressedKeys()
        };
    }
}

const inputManagerInstance = new InputManager();
export default inputManagerInstance;