import uiManagerInstance from './UIManager.js';

import { WebcamButton } from './WebcamButton.js'; //we import the entire class but we only use initWebcamButtonEvent 
import { Tab } from './Tab.js';


import { ENIGMA_STATUS } from '../Utils/Constant.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';

import gameEngineInstance from '../Core/GameEngine.js';


export class TabManager {
    constructor() {
        this.loadTabs();

        this.initEventListeners();

        this.webcamContainer = document.getElementById("webcam-container");

        this.activeTabId = 'welcome';
        this.tabs['welcome'].status = ENIGMA_STATUS.AVAILABLE; // we may have problem if we don't do that
        this.showTab(this.activeTabId);
    }

    loadTabs() {
        this.tabs = {
            welcome: new Tab('welcome', 'Accueil', document.querySelector('.tab-button[data-target="dummy-button"]'), document.getElementById("panel-welcome")), // we use a dummy button for welcome because it is not a tab we will access after the beginning
            lsf: new Tab(ENIGMA_IDS.LSF, 'Langue des signes française', document.querySelector('.tab-button[data-target="lsf"]'), document.getElementById("panel-lsf"), document.getElementById("panel-lsf-victory")),
            aruco: new Tab(ENIGMA_IDS.ARUCO, 'Scanner aruco', document.querySelector('.tab-button[data-target="aruco"]'), document.getElementById("panel-aruco")),
            colors: new Tab(ENIGMA_IDS.COLORS, 'Scanner de couleurs', document.querySelector('.tab-button[data-target="colors"]'), document.getElementById("panel-colors")),
            victoire: new Tab('victoire', 'La  victoire est vôtre', document.querySelector('.tab-button[data-target="victoire"]'), document.getElementById("panel-victoire"))
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


        // 2. Initialisation du bouton de la webcam (découpée en sous-fonctions)
        const webcamButton = new WebcamButton();
        webcamButton.initWebcamButtonEvent();
    }

    /**
     * Useful to show only the tab we are looking at. Also show the webcam interface depending on the tab we are using.
     */
    showTab(tabId) {
        this.activeTabId = tabId;

        // 1. On désactive TOUS les onglets
        Object.values(this.tabs).forEach(tab => tab.deactivateTab());

        // 2. On active uniquement celui demandé
        if (this.tabs[tabId]) {
            this.tabs[tabId].activateTab();
        }

        // 3. Gestion de la Caméra Globale
        const tabsWithWebcam = [ENIGMA_IDS.LSF, ENIGMA_IDS.ARUCO, ENIGMA_IDS.COLORS];
        if (!(tabId === 'welcome')) { //security so that we don't check gameEngineInstance in the welcome page (gameEngineInstance has yet to start)
            if (this.webcamContainer) {
                if (tabsWithWebcam && !gameEngineInstance.dictionnaryOfEnigmas[tabId].isResolved) {
                    this.webcamContainer.style.display = "block";
                } else {
                    this.webcamContainer.style.display = "none";
                }
            } else {
                console.log("DEBUG : webcamcontainer is not defined anymore");
            }
        }


        this.displayOrNotLsfTextBox(tabId);

        // 5. Masquage de la barre de navigation sur l'accueil
        if (this.tabContainer) {
            this.tabContainer.style.display = (tabId === 'welcome') ? "none" : "flex";
        }
    }

    displayOrNotLsfTextBox(tabId) {

        this.lsfTextBox = document.getElementById("lsf-sign-box");

        if (this.lsfTextBox) { //if we are on the tab lsf and lsf enigma is not yet resolved
            this.lsfTextBox.style.display = (tabId === ENIGMA_IDS.LSF && !gameEngineInstance.dictionnaryOfEnigmas[tabId].isResolved) ? "block" : "none";
        } else {
            console.log("We are missing the lsf box");
        }
    }


    /**
     * Shows what letter we detect
     */
    updateGestureDebugText(gestures) {
        // SÉCURITÉ : On filtre les éléments vides ou non définis
        const gestesValides = gestures.filter(g => g && g !== "");

        if (gestures.length > 0) {
            this.lsfTextBox.style.backgroundColor = "#E91E63";
            this.lsfTextBox.innerText = `Signe(s) : ${gestures.join(" + ")}`;
        } else {
            this.lsfTextBox.style.backgroundColor = "#007f8b";
            this.lsfTextBox.innerText = "Aucun signe clair.";
        }
    }

}