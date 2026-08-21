import uiManagerInstance from '../UIManager.js';

import { WebcamButton } from '../WebcamButton.js'; //we import the entire class but we only use initWebcamButtonEvent 
import { Tab } from './Tab.js';
import { showTimer } from '../TimerUI.js';


import { ENIGMA_STATUS } from '../../Utils/Constant.js';
import { ENIGMA_IDS } from '../../Utils/Constant.js';
import { HELP_IDS } from '../../Utils/Constant.js';


import gameEngineInstance from '../../GameLogic/GameEngine.js';


export class TabManager {
    constructor() {
        this.loadTabs();

        this.initEventListeners();

        this.webcamContainer = document.getElementById("webcam-container");

        this.activeTabId = 'welcome';
        this.tabs['welcome'].status = ENIGMA_STATUS.AVAILABLE; // we may have problem if we don't do that
        this.showTab(this.activeTabId);

        this.tabContainer = document.querySelector('.btn-tab-container');

    }

    loadTabs() {
        this.tabs = {
            welcome: new Tab('welcome', 'Accueil', document.querySelector('.tab-button[data-target="dummy-button"]'), document.getElementById("panel-welcome")), // we use a dummy button for welcome because it is not a tab we will access after the beginning
            lsf: new Tab(ENIGMA_IDS.LSF, '👉👈⬇️✋✋〰️➡️👌', document.querySelector('.tab-button[data-target="lsf"]'), document.getElementById("panel-lsf"), document.getElementById("panel-lsf-victory")),
            aruco: new Tab(ENIGMA_IDS.ARUCO, 'Vrai ou faux', document.querySelector('.tab-button[data-target="aruco"]'), document.getElementById("panel-aruco"), document.getElementById("panel-aruco-victory")),
            colors: new Tab(ENIGMA_IDS.COLORS, 'Apprentissage coloré', document.querySelector('.tab-button[data-target="colors"]'), document.getElementById("panel-colors"), document.getElementById("panel-colors-victory")),
            chatbot: new Tab(HELP_IDS.CHATBOT, 'Chatbot du futur', document.querySelector('.tab-button[data-target="chatbot"]'), document.getElementById("panel-chatbot")),
            guilty: new Tab(ENIGMA_IDS.GUILTY, "c ki le vilain ?", document.querySelector('.tab-button[data-target="guilty"]'), document.getElementById("panel-guilty"), document.getElementById("panel-guilty-victory")),
            final: new Tab(ENIGMA_IDS.FINAL, 'Final Reckoning', document.querySelector('.tab-button[data-target="final"]'), document.getElementById("panel-final"), document.getElementById("panel-final-victory")),
            victoire: new Tab('victoire', 'Veni vidi vici', document.querySelector('.tab-button[data-target="victoire"]'), document.getElementById("panel-victoire"))
        };
    }

    /**
     * Listen to click on the global naviguation
     */
    initEventListeners() {

        // 1. Écouteurs pour la barre de navigation classique
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                const targetId = e.currentTarget.getAttribute('data-target');
                this.showTab(targetId);
            });
        });
    }

    /**
     * Useful to show only the tab we are looking at. Also show the webcam interface depending on the tab we are using.
     */
    showTab(tabId) {
        this.activeTabId = tabId;

        // we deactivate all tabs (not really clean but the deactivate is pretty light and has a security to check if the tab is activeOrNot)
        Object.values(this.tabs).forEach(tab => tab.deactivateTab());

        // We activate the one asked
        if (this.tabs[tabId]) {
            this.tabs[tabId].activateTab();
        } else {
            console.log("DEBUG : could not activate this Tab");
        }

        this.displayOrNotWebcam(tabId);
        this.displayOrNotNavigationBar(tabId); //we don't display the naviguation bar only on the welcome page for the moment
        showTimer(tabId !== 'welcome'); //le compte à rebours suit le joueur sur tous les onglets sauf l'accueil
    }

    displayOrNotWebcam(tabId) {
        const tabsWithWebcam = [ENIGMA_IDS.LSF, ENIGMA_IDS.ARUCO, ENIGMA_IDS.COLORS];

        if (tabId === 'welcome') return; //security so that we don't check gameEngineInstance in the welcome page (gameEngineInstance has yet to start)

        if (!this.webcamContainer) {
            console.log("DEBUG : webcamcontainer is not defined anymore");
            return;
        }

        if (tabsWithWebcam.includes(tabId) && !gameEngineInstance.dictionnaryOfEnigmas[tabId].isResolved) {
            this.webcamContainer.style.display = "block";
        } else {
            this.webcamContainer.style.display = "none";
        }
    }

    displayOrNotNavigationBar(tabId) {
        if (this.tabContainer) {
            this.tabContainer.style.display = (tabId === 'welcome') ? "none" : "flex";
        } else {
            console.log("DEBUG : tabContainer undefined, cannot show or hide the naviguation bar ");
        }
    }

    unlockAndShowBeginningPanels() {
        uiManagerInstance.tabManager.tabs[ENIGMA_IDS.ARUCO].unlockTab(); //we activate here the buttons
        uiManagerInstance.tabManager.tabs[ENIGMA_IDS.COLORS].unlockTab();
        uiManagerInstance.tabManager.showTab(ENIGMA_IDS.COLORS);//we make this tab active (open)
    }

}