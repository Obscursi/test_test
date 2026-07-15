

import { WebcamButton } from './WebcamButton.js'; //we import the entire class but we only use initWebcamButtonEvent 

import { Tab } from './Tab.js';

import { playTabUnlockingSound } from '../Utils/AudioSynth.js';

import gameEngineInstance from '../Core/GameEngine.js'

class UIManager {

    constructor() {
        // --- we get the element of the interface ---
        this.btnWebcam = document.getElementById("webcamButton");
        this.loadingMessage = document.getElementById("loadingMessage");
        this.lsfTextBox = document.getElementById("lsf-sign-box");
        this.notificationBanner = document.getElementById("notification-banner");
        this.webcamContainer = document.getElementById("webcam-container");
        this.tabContainer = document.querySelector('.tab-container');


        // --- configuration of the fancy cinematic ---
        this.cinematicOverlay = document.getElementById("unlock-cinematic");
        this.cinematicText = document.getElementById("cinematic-tab-name");
        this.cinematicContent = this.cinematicOverlay?.querySelector(".cinematic-content");

        // --- getting all the tabs ---
        this.tabs = {
            welcome: new Tab('welcome', 'Accueil', document.querySelector('.tab-button[data-target="dummy-button"]'), document.getElementById("panel-welcome")), // we use a dummy button for welcome because it is not a tab we will access after the beginning
            lsf: new Tab('lsf', 'Langue des signes française', document.querySelector('.tab-button[data-target="lsf"]'), document.getElementById("panel-lsf"), document.getElementById("panel-lsf-victory")),
            aruco: new Tab('aruco', 'Scanner aruco', document.querySelector('.tab-button[data-target="aruco"]'), document.getElementById("panel-aruco")),
            colors: new Tab('colors', 'Scanner de couleurs', document.querySelector('.tab-button[data-target="colors"]'), document.getElementById("panel-colors")),
            victoire: new Tab('victoire', 'La  victoire est vôtre', document.querySelector('.tab-button[data-target="victoire"]'), document.getElementById("panel-victoire"))
        };

        this.activeTabId = 'welcome';
        this.tabs['welcome'].status = 'available'; // we may have problem if we don't do that

        this.initEventListeners();
        this.showTab(this.activeTabId);

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

        this.tabs[tabId].activateTab;

        // 1. On désactive TOUS les onglets
        Object.values(this.tabs).forEach(tab => tab.deactivateTab());

        // 2. On active uniquement celui demandé
        if (this.tabs[tabId]) {
            this.tabs[tabId].activateTab();
        }

        // 3. Gestion de la Caméra Globale
        const tabsWithWebcam = ['lsf', 'aruco', 'colors'];
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
        if (this.lsfTextBox) { //if we are on the tab lsf and lsf enigma is not yet resolved
            this.lsfTextBox.style.display = (tabId === 'lsf' && !gameEngineInstance.dictionnaryOfEnigmas[tabId].isResolved) ? "block" : "none";
        } else {
            console.log("We are missing the lsf box");
        }
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

    showError(message) {
        this.loadingMessage.innerText = message;
        this.loadingMessage.style.color = "red";
        this.loadingMessage.style.display = "inline";
    }

    showNotification(message) {
        this.notificationBanner.innerText = message;
        this.notificationBanner.style.display = "block";

        setTimeout(() => {
            this.notificationBanner.style.display = "none";
        }, 3000);
    }

    showVictoryScreen() {
        this.showTab('victoire');
    }

    /**
     * Makes a fancy animation adn then show the button to access the tab of the enigma unlocked
     */
    launchUnlockingAnimation(idOfNewTab) {
        const newTab = this.tabs[idOfNewTab];
        if (!newTab) return;

        newTab.unlockTab();
        if (this.cinematicOverlay) {
            this.cinematicText.innerText = newTab.name;
            playTabUnlockingSound();

            this.cinematicOverlay.style.display = "flex";

            setTimeout(() => {
                this.cinematicOverlay.style.opacity = "1";
                this.cinematicContent.classList.add("cinematic-animate");
            }, 10);

            setTimeout(() => {
                this.cinematicOverlay.style.opacity = "0";

                setTimeout(() => {
                    this.cinematicOverlay.style.display = "none";
                    this.cinematicContent.classList.remove("cinematic-animate");

                    if (newTab.bouton) {
                        newTab.bouton.classList.add("unlock-animation");
                        setTimeout(() => newTab.bouton.classList.remove("unlock-animation"), 1500);
                    }
                }, 300);
            }, 5000);
        }
    }


}

//Singleton creation : 
const uiManagerInstance = new UIManager();
export default uiManagerInstance;