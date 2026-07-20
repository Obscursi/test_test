import { WebcamButton } from './WebcamButton.js'; //we import the entire class but we only use initWebcamButtonEvent 
import { Tab } from './Tabs/Tab.js';
import { EnigmaUnlockingAnimation } from './EnigmaUnlockingAnimation.js';
import { TabManager } from './Tabs/TabManager.js';
import { PanelManager } from './PanelUI/PanelManager.js';

import { ENIGMA_IDS } from '../Utils/Constant.js';

import gameEngineInstance from '../Core/GameEngine.js'



class UIManager {

    constructor() {

        this.loadHTMLelements();

        const webcamButton = new WebcamButton();
        webcamButton.initWebcamButtonEvent();

        this.tabManager = new TabManager();
        this.enigmaUnlockAnimation = new EnigmaUnlockingAnimation();
        this.panelManager = new PanelManager();

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

    hideLoading() {
        this.loadingMessage.style.display = "none";
    }

    loadHTMLelements() {
        // --- we get the element of the interface ---
        this.btnWebcam = document.getElementById("webcamButton");
        this.loadingMessage = document.getElementById("loadingMessage");
        this.notificationBanner = document.getElementById("notification-banner");



        const btnReload = document.getElementById('btn-reload-system');
        if (btnReload) {
            btnReload.addEventListener('click', () => {
                console.log("🔄 Lancement du protocole de redémarrage intégral...");

                //it seems weird but it is the modern way (we change the url with the date so that everything is loaded, because the cache is empty)
                const urlWithoutParameters = window.location.pathname;
                window.location.href = urlWithoutParameters + "?t=" + Date.now();
            });
        }
    }


}

//Singleton creation : 
const uiManagerInstance = new UIManager();
export default uiManagerInstance;