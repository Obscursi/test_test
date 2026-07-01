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
            welcome: document.getElementById("panel-welcome"),
            lsf: document.getElementById("panel-lsf"),
            aruco: document.getElementById("panel-aruco"),
            victoire: document.getElementById("panel-victoire")
        };

        this.lockedTabButtons = ["btn-tab-aruco"]; //here we will have all the references to the buttons to unlock all the enigmas
        this.currentUnlockIndex = 0;
        this.activeTabId = 'welcome';

        // NOUVEAU : Liste ordonnée des cibles ('data-target') pour savoir qui mettre en Vert
        this.ongletsChronologiques = ["lsf", "aruco"];

        this.tabContainer = document.querySelector('.tab-container');

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
        this.initWebcamButtonEvent();
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

        //If we are on the welcome page we do not show the tabs of enigmas
        if (this.tabContainer) {
            // Invisible sur l'accueil, visible partout ailleurs
            this.tabContainer.style.display = (tabId === 'welcome') ? "none" : "flex";
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

        const idOngletTermine = this.ongletsChronologiques[this.currentUnlockIndex];
        if (idOngletTermine) {
            // On cherche le bouton qui possède ce data-target précis
            const boutonTermine = document.querySelector(`.tab-button[data-target="${idOngletTermine}"]`);
            if (boutonTermine) {
                boutonTermine.classList.add("completed");
            }
        }

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

    // ==========================================
    // SÉQUENCE CINÉMATOGRAPHIQUE D'INTRODUCTION
    // ==========================================

    /**
     * Point d'entrée principal du clic sur le bouton de démarrage.
     */
    initWebcamButtonEvent() {
        if (!this.btnWebcam) return;

        this.btnWebcam.addEventListener('click', async () => {
            await this.preparerAutorisationWebcam();

            try {
                // Le navigateur met le code en pause ici pour demander la caméra
                await navigator.mediaDevices.getUserMedia({ video: true });

                // Si accepté, on lance la suite des animations
                const tempsAttente = this.declencherExplosionSas();
                this.transitionnerVersJeu(tempsAttente);

            } catch (erreur) {
                this.gererRefusWebcam(erreur);
            }
        });
    }

    /**
     * Modifie l'état du bouton et laisse le temps au navigateur de s'actualiser.
     */
    async preparerAutorisationWebcam() {
        this.btnWebcam.disabled = true;
        this.btnWebcam.innerText = "AUTORISATION REQUISE (VOIR POP-UP)...";
        this.btnWebcam.style.animation = "none";
        this.btnWebcam.style.backgroundColor = "#f57c00";

        // La fameuse micro-pause pour que le CSS s'applique avant la pop-up
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    /**
     * Fait exploser les éléments de l'accueil un par un.
     * @returns {number} Le temps total (en ms) que va durer l'explosion.
     */
    declencherExplosionSas() {
        this.btnWebcam.innerText = "ACCÈS VALIDÉ. SURCHARGE DU SAS...";
        this.btnWebcam.style.backgroundColor = "#ff5252";

        const welcomePanel = this.tabs['welcome'];
        const elementsAccueil = Array.from(welcomePanel.children);

        elementsAccueil.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.15}s`;
            element.classList.add("explode-out");
        });

        // Calcul du temps total de l'animation
        return (elementsAccueil.length * 150) + 600;
    }

    /**
     * Bascule sur l'onglet LSF et lance l'éblouissement global de l'écran.
     * @param {number} delai - Le temps à attendre avant de lancer la transition.
     */
    transitionnerVersJeu(delai) {
        setTimeout(() => {
            // Nettoyage de la navigation
            const ongletAccueil = document.querySelector('.tab-button[data-target="welcome"]');
            if (ongletAccueil) ongletAccueil.style.display = "none";

            // Bascule sur le puzzle
            this.showTab('lsf');

            // Activation visuelle de l'onglet LSF
            const ongletLsf = document.querySelector('.tab-button[data-target="lsf"]');
            if (ongletLsf) {
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                ongletLsf.classList.add('active');
            }

            // Allumage aveuglant du système
            document.body.classList.add("global-boot");

            // Nettoyage final pour ne pas polluer le DOM
            setTimeout(() => {
                document.body.classList.remove("global-boot");
            }, 3500);

        }, delai);
    }

    /**
     * Verrouille l'interface si l'utilisateur refuse la caméra.
     */
    gererRefusWebcam(erreur) {
        console.warn("Accès caméra refusé :", erreur);
        this.btnWebcam.innerText = "ACCÈS REFUSÉ. SYSTÈME VERROUILLÉ.";
        this.btnWebcam.style.backgroundColor = "#ff5252";
    }
}