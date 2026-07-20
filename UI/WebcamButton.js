import uiManagerInstance from '../UI/UIManager.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';


export class WebcamButton {

    constructor() {
        this.btnWebcam = document.getElementById("webcamButton");
    }
    /**
     * Point d'entrée principal du clic sur le bouton de démarrage.
     * Cette fonction bloque l'exécution jusqu'à ce que la caméra soit autorisée.
     */
    initWebcamButtonEvent() {
        if (!this.btnWebcam) return Promise.reject("Bouton introuvable");

        // NOUVEAU : On encapsule l'écouteur dans une Promise.
        // Le code appelant (UIManager) sera mis en pause jusqu'à ce qu'on appelle resolve().
        return new Promise((resolve, reject) => {

            this.btnWebcam.addEventListener('click', async () => {
                await this.prepareWebcamAutorisation();

                try {
                    // Le navigateur met le code en pause ici pour demander la caméra
                    await navigator.mediaDevices.getUserMedia({ video: true });

                    // VICTOIRE : La caméra est acceptée, on débloque le UIManager !
                    resolve(true);

                } catch (erreur) {
                    this.buttonChangeIfCameraAccessRefused(erreur);

                    // ÉCHEC : On rejette la promesse, le UIManager ira dans son bloc "catch"
                    reject(erreur);
                }
            });

        });
    }
    /**
     * Modifie l'état du bouton et laisse le temps au navigateur de s'actualiser.
     */
    async prepareWebcamAutorisation() {
        this.btnWebcam.disabled = true;
        this.btnWebcam.innerText = "AUTORISATION REQUISE (VOIR POP-UP)...";
        this.btnWebcam.style.animation = "none";
        this.btnWebcam.style.backgroundColor = "#f57c00";

        // La fameuse micro-pause pour que le CSS s'applique avant la pop-up
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    /**
     * Verrouille l'interface si l'utilisateur refuse la caméra.
     */
    buttonChangeIfCameraAccessRefused(erreur) {
        console.warn("Accès caméra refusé :", erreur);
        this.btnWebcam.innerText = "ACCÈS REFUSÉ. SYSTÈME VERROUILLÉ.";
        this.btnWebcam.style.backgroundColor = "#ff5252";
    }

    /**
 * Modifies the visuel state of the webcam button depending or wheter or not it is activated
 */
    updateWebcamButton(isRunning, isReady = true) {
        if (!isReady) {
            this.btnWebcam.disabled = true;
            this.btnWebcam.innerText = "ATTENTE DU CHARGEMENT...";
            return;
        }

        // L'IA est prête, le bouton s'allume !
        this.btnWebcam.disabled = false;
        this.btnWebcam.innerText = "DÉMARRER LA MISSION";
    }

}





