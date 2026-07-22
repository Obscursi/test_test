import { WebcamButton } from './WebcamButton.js'; //we import the entire class but we only use initWebcamButtonEvent 
import { Tab } from './Tabs/Tab.js';
import { Animations } from './Animations.js';
import { TabManager } from './Tabs/TabManager.js';
import { PanelManager } from './PanelUI/PanelManager.js';

import { ENIGMA_IDS } from '../Utils/Constant.js';

import gameEngineInstance from '../Core/GameEngine.js'
import { TerminalManager } from './TerminalManager.js';



class UIManager {

    constructor() {

        this.loadHTMLelements();

        this.tabManager = new TabManager();
        this.animations = new Animations();
        this.panelManager = new PanelManager();
        this.webcamButton = new WebcamButton();
        this.terminalManager = new TerminalManager();

    }

    async initBeginningOfTheGame() { //we transition from the welcome screen with the big button to first enigmas

        try {
            const isWebcamButtonReady = await this.webcamButton.initWebcamButtonEvent();
        } catch (error) {
            console.log("DEBUG : probleme webcam");
            return false;
        }

        const waitingTime = this.animations.launchAnimationOutOfWelcomePanel();
        this.panelManager.panelWelcome.transitionToBeginningTab(waitingTime);
    }


    hideLoading() {
        this.loadingMessage.style.display = "none";
    }

    loadHTMLelements() {
        // --- we get the element of the interface ---
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

uiManagerInstance.initBeginningOfTheGame();
