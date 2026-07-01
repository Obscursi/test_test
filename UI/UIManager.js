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
            aruco: document.getElementById("panel-aruco"),
            victoire: document.getElementById("panel-victoire")
        };

        this.lockedTabButtons = ["btn-tab-aruco"]; //here we will have all the references to the buttons to unlock all the enigmas
        this.currentUnlockIndex = 0;
        this.activeTabId = 'accueil';

        // NOUVEAU : Liste ordonnée des cibles ('data-target') pour savoir qui mettre en Vert
        this.ongletsChronologiques = ["lsf", "aruco"];

        this.tabContainer = document.querySelector('.tab-container');

        this.initEventListeners();
        this.showTab(this.activeTabId);
    }

    /**
     * Listen to click on the global naviguation
     */
    /**
     * Écoute les clics sur l'interface globale.
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

        // 2. NOUVEAU : Le clic sur le bouton de démarrage géant !
        // 2. Le clic sur le bouton de démarrage géant avec pause pour l'autorisation
        if (this.btnWebcam) {
            this.btnWebcam.addEventListener('click', async () => {

                // --- ÉTAPE 1 : CHANGEMENT DU TEXTE ---
                this.btnWebcam.disabled = true;
                this.btnWebcam.innerText = "AUTORISATION REQUISE (VOIR POP-UP)...";
                this.btnWebcam.style.animation = "none";
                this.btnWebcam.style.backgroundColor = "#f57c00";

                // --- ÉTAPE 1.5 : LA MICRO-PAUSE VITALE ---
                // Laisse 50ms au navigateur pour repeindre le bouton avant de geler l'écran
                await new Promise(resolve => setTimeout(resolve, 50));

                try {
                    // --- ÉTAPE 2 : PAUSE JUSQU'À L'AUTORISATION ---
                    await navigator.mediaDevices.getUserMedia({ video: true });

                    // --- ÉTAPE 3 : L'EXPLOSION SÉQUENTIELLE VIOLENTE ---
                    this.btnWebcam.innerText = "ACCÈS VALIDÉ. SURCHARGE DU SAS...";
                    this.btnWebcam.style.backgroundColor = "#ff5252";

                    const accueilPanel = this.tabs['accueil'];
                    const elementsAccueil = Array.from(accueilPanel.children);

                    elementsAccueil.forEach((element, index) => {
                        element.style.animationDelay = `${index * 0.15}s`;
                        element.classList.add("explode-out");
                    });

                    // Temps d'attente avant la fin de l'explosion
                    const tempsAttente = (elementsAccueil.length * 150) + 600;

                    // --- ÉTAPE 4 : LE FLASH GLOBAL SUR TOUT L'ÉCRAN ---
                    setTimeout(() => {
                        // On cache le sas détruit
                        const ongletAccueil = document.querySelector('.tab-button[data-target="accueil"]');
                        if (ongletAccueil) ongletAccueil.style.display = "none";

                        // On bascule la logique sur le jeu LSF
                        this.showTab('lsf');

                        const ongletLsf = document.querySelector('.tab-button[data-target="lsf"]');
                        if (ongletLsf) {
                            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                            ongletLsf.classList.add('active');
                        }

                        // LA MAGIE : On applique le flash d'allumage à TOUT le corps de la page
                        document.body.classList.add("global-boot");

                        // Optionnel : on retire la classe après l'animation pour nettoyer le code (3.5s)
                        setTimeout(() => {
                            document.body.classList.remove("global-boot");
                        }, 3500);

                    }, tempsAttente);

                } catch (erreur) {
                    console.warn("Accès caméra refusé :", erreur);
                    this.btnWebcam.innerText = "ACCÈS REFUSÉ. SYSTÈME VERROUILLÉ.";
                    this.btnWebcam.style.backgroundColor = "#ff5252";
                }
            });
        }
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

        if (this.tabContainer) {
            // Invisible sur l'accueil, visible partout ailleurs
            this.tabContainer.style.display = (tabId === 'accueil') ? "none" : "flex";
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
}