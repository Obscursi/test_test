import { playTabUnlockingSound } from '../Utils/AudioSynth.js';

import { WebcamButton } from './WebcamButton.js'; //we import the entire class but we only use initWebcamButtonEvent 

import { Tab } from './Tab.js';

class UIManager {

    constructor() {
        // --- we get the element of the interface ---
        this.btnWebcam = document.getElementById("webcamButton");
        this.loadingMessage = document.getElementById("loadingMessage");
        this.gestureOutput = document.getElementById("gesture_output");
        this.notificationBanner = document.getElementById("notification-banner");
        this.webcamContainer = document.getElementById("webcam-container");
        this.tabContainer = document.querySelector('.tab-container');


        // --- configuration of the fancy cinematic ---
        this.cinematicOverlay = document.getElementById("unlock-cinematic");
        this.cinematicText = document.getElementById("cinematic-tab-name");
        this.cinematicContent = this.cinematicOverlay?.querySelector(".cinematic-content");

        // --- getting all the tabs ---
        this.tabs = {
            welcome: new Tab('welcome', 'Accueil', document.querySelector('.tab-button[data-target="welcome"]'), document.getElementById("panel-welcome")),
            lsf: new Tab('lsf', 'Langue des Signes', document.querySelector('.tab-button[data-target="lsf"]'), document.getElementById("panel-lsf")),
            aruco: new Tab('aruco', 'Scanner Aruco', document.querySelector('.tab-button[data-target="aruco"]'), document.getElementById("panel-aruco")),
            victoire: new Tab('victoire', 'Système Déverrouillé', document.querySelector('.tab-button[data-target="victoire"]'), document.getElementById("panel-victoire"))
        };
        console.log("🕵️ Vérification des panneaux HTML :", this.onglets);

        // PLUS D'ORDRE STRICT NI D'INDEX !
        this.activeTabId = 'welcome';

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
        const tabsWithWebcam = ['lsf', 'aruco'];
        if (this.webcamContainer) {
            this.webcamContainer.style.display = tabsWithWebcam.includes(tabId) ? "block" : "none";
        }

        // 4. Gestion de la boîte de texte LSF
        if (this.gestureOutput) {
            this.gestureOutput.style.display = (tabId === 'lsf') ? "block" : "none";
        }

        // 5. Masquage de la barre de navigation sur l'accueil
        if (this.tabContainer) {
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
        this.gestureOutput.innerText = "Tab Victoire à rajouter !";
    }

    /**
     * Makes a fancy animation adn then show the button to access the tab of the enigma unlocked
     */
    // ==========================================
    // GESTION DE LA PROGRESSION (CHEMINS PARALLÈLES)
    // ==========================================

    /**
     * Appelé par ton GameEngine quand une énigme spécifique est réussie.
     * @param {string} idEnigme - L'ID de l'énigme (ex: 'lsf' ou 'aruco')
     */
    completeEnigma(idEnigme) {
        const onglet = this.tabs[idEnigme];

        // Si l'onglet n'existe pas ou est déjà résolu, on ignore
        if (!onglet || onglet.status === 'resolved') return;

        // 1. On passe l'onglet en Vert
        onglet.makeTabCompleted();

        // Petit effet sonore pour confirmer la réussite d'une étape
        playTabUnlockingSound();

        // 2. On vérifie si cela débloque de nouvelles choses
        this.globalProgression();
    }

    /**
     * Le "Cerveau" : vérifie l'état de tous les onglets pour voir si on avance.
     */
    globalProgression() {
        const lsfFini = this.tabs['lsf'].status === 'resolved';
        const arucoFini = this.tabs['aruco'].status === 'resolved';
        const victoireVerrouillee = this.tabs['victoire'].status === 'locked';

        // RÈGLE PARALLÈLE : Si les deux chemins sont terminés, on débloque la Victoire
        if (lsfFini && arucoFini && victoireVerrouillee) {
            this.launchUnlockingAnimation('victoire');
        }

        if (lsfFini) { this.launchUnlockingAnimation('aruco'); }

        // Tu pourras ajouter d'autres règles ici plus tard si tu ajoutes des énigmes !
        // Exemple : if (lsfFini && !arucoFini) { this.launchUnlockingAnimation('aruco'); }
    }

    /**
     * Gère l'animation visuelle quand un NOUVEL onglet apparaît.
     * @param {string} idOfNewTab - L'ID de l'onglet à débloquer
     */
    launchUnlockingAnimation(idOfNewTab) {
        const newTab = this.tabs[idOfNewTab];
        if (!newTab) return;

        // On le passe en Orange (available)
        newTab.unlockTab();
        console.log("débloque d'onglet");
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