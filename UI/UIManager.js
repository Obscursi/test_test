// UI/UIManager.js

import { playTabUnlockingSound } from '../Utils/AudioSynth.js';

export class UIManager {
    constructor() {
        // --- we get the element of the interface ---
        this.btnWebcam = document.getElementById("webcamButton");
        this.loadingMessage = document.getElementById("loadingMessage");
        this.gestureOutput = document.getElementById("gesture_output");
        this.notificationBanner = document.getElementById("notification-banner");
        this.webcamContainer = document.getElementById("webcam-container");

        // --- configuration of the fancy cinematic ---
        this.cinematicOverlay = document.getElementById("unlock-cinematic");
        this.cinematicText = document.getElementById("cinematic-tab-name");
        this.cinematicContent = this.cinematicOverlay?.querySelector(".cinematic-content");

        // --- getting all the tabs ---
        this.tabs = {
            accueil: document.getElementById("panel-accueil"),
            lsf: document.getElementById("panel-lsf"),
            opencv: document.getElementById("panel-opencv"),
            victoire: document.getElementById("panel-victoire")
        };

        this.lockedTabButtons = ["btn-tab-opencv"]; //here we will have all the references to the buttons to unlock all the enigmas
        this.currentUnlockIndex = 0;
        this.activeTabId = 'accueil';

        this.initEventListeners();
        this.showTab(this.activeTabId);
    }

    /**
     * Listen to click on the global naviguation
     */
    initEventListeners() {
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

        // 1. On cache tous les panneaux
        for (const key in this.tabs) {
            if (this.tabs[key]) {
                this.tabs[key].style.display = "none";
            }
        }

        // 2. On affiche le panneau demandé
        if (this.tabs[tabId]) {
            this.tabs[tabId].style.display = "block";
        }

        // 3. Gestion de l'affichage de la CAMÉRA GLOBALE
        const tabsWithWebcam = ['lsf', 'opencv'];
        if (this.webcamContainer) {
            this.webcamContainer.style.display = tabsWithWebcam.includes(tabId) ? "block" : "none";
        }

        // 4. CORRECTION : Gestion de la boîte de texte LSF
        if (this.gestureOutput) {
            // Elle ne s'affiche QUE si on est sur l'onglet 'lsf'
            this.gestureOutput.style.display = (tabId === 'lsf') ? "block" : "none";
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

        this.btnWebcam.disabled = false;
        if (isRunning) {
            this.btnWebcam.innerText = "COUPE LA WEBCAM";
            this.btnWebcam.style.backgroundColor = "#ff5252";
        } else {
            this.btnWebcam.innerText = "ACTIVER LA WEBCAM";
            this.btnWebcam.style.backgroundColor = "#007f8b";
        }
    }

    hideLoading() {
        this.loadingMessage.style.display = "none";
    }

    /**
     * Shows what letter we detect
     */
    updateGestureDebugText(gestures) {
        if (gestures.length > 0) {
            this.gestureOutput.style.backgroundColor = "#E91E63";
            this.gestureOutput.innerText = `Gestes : ${gestures.join(" + ")}`;
        } else {
            this.gestureOutput.style.backgroundColor = "#007f8b";
            this.gestureOutput.innerText = "Mains détectées, aucun geste clair.";
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
        this.gestureOutput.style.backgroundColor = "#FFD700";
        this.gestureOutput.style.color = "#000";
        this.gestureOutput.innerText = "SYSTÈME DÉVERROUILLÉ !";
    }

    /**
     * Makes a fancy animation adn then show the button to access the tab of the enigma unlocked
     */
    unlockNextTabButton() {
        if (this.currentUnlockIndex >= this.lockedTabButtons.length) return;

        const idBouton = this.lockedTabButtons[this.currentUnlockIndex];
        const bouton = document.getElementById(idBouton);

        if (bouton && this.cinematicOverlay) {
            this.cinematicText.innerText = bouton.innerText;

            // Déclenchement de la piste audio isolée
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
                }, 300);

                bouton.style.display = "inline-block"; //we show the new enigma tab
                void bouton.offsetWidth;
                bouton.classList.add("unlock-animation");

                setTimeout(() => {
                    bouton.classList.remove("unlock-animation");
                }, 1500);

            }, 5000);
        }

        this.currentUnlockIndex++;
    }
}