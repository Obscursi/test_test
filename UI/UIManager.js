export class UIManager {
    constructor() {
        // --- Récupération des éléments d'interface ---
        this.btnWebcam = document.getElementById("webcamButton");
        this.loadingMessage = document.getElementById("loadingMessage");
        this.gestureOutput = document.getElementById("gesture_output");
        this.notificationBanner = document.getElementById("notification-banner");

        this.cameraContainer = document.getElementById("camera-container");

        // Liste des onglets
        this.tabs = {
            accueil: document.getElementById("panel-accueil"),
            lsf: document.getElementById("panel-lsf"),
            opencv: document.getElementById("panel-opencv"),
            victoire: document.getElementById("panel-victoire")
        };

        this.lockedTabButtons = ["btn-tab-opencv"]; // Ajoute les futurs boutons ici
        this.currentUnlockIndex = 0; // L'index du prochain bouton à révéler

        this.activeTabId = 'accueil'; // Onglet par défaut
        this.initEventListeners();

        // NOUVEAU : Au démarrage, on range la caméra dans l'onglet actif
        this.showTab(this.activeTabId);


        //for animation
        this.cinematicOverlay = document.getElementById("unlock-cinematic");
        this.cinematicText = document.getElementById("cinematic-tab-name");
        this.cinematicContent = this.cinematicOverlay.querySelector(".cinematic-content");
    }

    // Gère les clics sur les boutons de navigation (les vrais onglets HTML)
    initEventListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // On retire la classe "active" de tous les boutons
                tabButtons.forEach(b => b.classList.remove('active'));
                // On ajoute la classe "active" au bouton cliqué
                e.currentTarget.classList.add('active');

                // On lit l'attribut data-target du bouton (ex: "lsf")
                const targetId = e.currentTarget.getAttribute('data-target');
                this.showTab(targetId);
            });
        });
    }



    // Cache tous les onglets et affiche le bon
    showTab(tabId) {
        this.activeTabId = tabId;

        // 1. On cache tous les panneaux
        for (const key in this.tabs) {
            if (this.tabs[key]) {
                this.tabs[key].style.display = "none";
            }
        }

        // 2. On affiche le panneau demandé
        const activePanel = this.tabs[tabId];
        if (activePanel) {
            activePanel.style.display = "block";
        }

        // 3. Gestion de l'affichage de la caméra (SANS la déplacer)
        const ongletsAvecCamera = ['lsf', 'opencv'];

        if (this.cameraContainer) {
            if (ongletsAvecCamera.includes(tabId)) {
                // Si l'onglet a besoin de la caméra, on affiche le bloc
                this.cameraContainer.style.display = "block";
            } else {
                // Sinon (Accueil, Victoire), on le cache
                this.cameraContainer.style.display = "none";
            }
        }
    }

    // Met à jour le bouton de la webcam (Texte et état cliquable)
    updateWebcamButton(isRunning, isReady = true) {
        if (!isReady) {
            this.btnWebcam.disabled = true;
            this.btnWebcam.innerText = "ATTENTE DU CHARGEMENT...";
            return;
        }

        this.btnWebcam.disabled = false;
        if (isRunning) {
            this.btnWebcam.innerText = "COUPE LA WEBCAM";
            this.btnWebcam.style.backgroundColor = "#ff5252"; // Rouge
        } else {
            this.btnWebcam.innerText = "ACTIVER LA WEBCAM";
            this.btnWebcam.style.backgroundColor = "#007f8b"; // Vert/Bleu classique
        }
    }

    hideLoading() {
        this.loadingMessage.style.display = "none";
    }

    // Le GameEngine appellera cette méthode 60 fois par seconde pour actualiser le texte
    updateGestureDebugText(gestures) {
        if (gestures.length > 0) {
            this.gestureOutput.style.backgroundColor = "#E91E63"; // Rose
            this.gestureOutput.innerText = `Gestes : ${gestures.join(" + ")}`;
        } else {
            this.gestureOutput.style.backgroundColor = "#007f8b"; // Couleur par défaut
            this.gestureOutput.innerText = "Mains détectées, aucun geste clair.";
        }
    }

    showError(message) {
        this.loadingMessage.innerText = message;
        this.loadingMessage.style.color = "red";
        this.loadingMessage.style.display = "inline";
    }

    // ==========================================
    // NOUVELLES FONCTIONS DE FIN DE JEU
    // ==========================================

    afficherNotification(message) {
        this.notificationBanner.innerText = message;
        this.notificationBanner.style.display = "block";

        // On la fait disparaître toute seule après 3 secondes
        setTimeout(() => {
            this.notificationBanner.style.display = "none";
        }, 3000);
    }

    afficherEcranVictoire() {
        // 1. On bascule sur le bel écran de victoire
        this.showTab('victoire');

        // 2. On change la couleur de la boîte de texte en doré/jaune
        this.gestureOutput.style.backgroundColor = "#FFD700";
        this.gestureOutput.style.color = "#000"; // Texte en noir pour que ce soit lisible
        this.gestureOutput.innerText = "SYSTÈME DÉVERROUILLÉ !";
    }

    // ==========================================
    // MÉTHODES DE PROGRESSION DU JEU
    // ==========================================
    unlockNextTabButton() {
        if (this.currentUnlockIndex < this.lockedTabButtons.length) {
            const idBouton = this.lockedTabButtons[this.currentUnlockIndex];
            const bouton = document.getElementById(idBouton);

            if (bouton && this.cinematicOverlay) {
                this.cinematicText.innerText = bouton.innerText;

                // ON JOUE LA NOUVELLE MÉLODIE ZELDA
                this.jouerSonVictoire();

                this.cinematicOverlay.style.display = "flex";

                setTimeout(() => {
                    this.cinematicOverlay.style.opacity = "1";
                    this.cinematicContent.classList.add("cinematic-animate");
                }, 10);

                // --- MODIFICATION ICI : On attend 5 secondes (5000ms) ---
                setTimeout(() => {

                    this.cinematicOverlay.style.opacity = "0";
                    setTimeout(() => {
                        this.cinematicOverlay.style.display = "none";
                        this.cinematicContent.classList.remove("cinematic-animate");
                    }, 300);

                    bouton.style.display = "inline-block";
                    void bouton.offsetWidth;
                    bouton.classList.add("unlock-animation");

                    setTimeout(() => {
                        bouton.classList.remove("unlock-animation");
                    }, 1500);

                }, 5000); // <-- 5000ms pour matcher le CSS et l'Audio
            }

            this.currentUnlockIndex++;
        }
    }

    // ==========================================
    // AUDIO SYNTHÉTIQUE (Zéro fichier MP3 requis)
    // ==========================================
    jouerSonVictoire() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const t0 = ctx.currentTime;

        const dureeMontee = 2.5; // Doit correspondre aux 50% de l'animation CSS

        // --- PISTE 1 : La montée de suspense (Sawtooth) ---
        const nbNotesMontee = 25;
        const interval = dureeMontee / nbNotesMontee; // Très rapide (0.1s par note)

        for (let i = 0; i < nbNotesMontee; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';

            // Fréquence qui monte progressivement (base 220Hz)
            osc.frequency.value = 220 * Math.pow(1.05946, i);

            // Pings agressifs et courts
            gain.gain.setValueAtTime(0, t0 + i * interval);
            gain.gain.linearRampToValueAtTime(0.1, t0 + i * interval + 0.02);
            gain.gain.linearRampToValueAtTime(0, t0 + i * interval + interval);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t0 + i * interval);
            osc.stop(t0 + i * interval + interval);
        }

        // --- PISTE 2 : Les étoiles scintillantes (Sine) ---
        for (let i = 0; i < 20; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; // Son pur comme une clochette

            // Fréquences très aiguës aléatoires (entre 1200Hz et 2500Hz)
            osc.frequency.value = 1200 + Math.random() * 1300;

            // Jouées au hasard pendant que le texte tourbillonne
            const time = t0 + Math.random() * dureeMontee;

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.06, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.5);
        }

        // --- PISTE 3 : L'accord de triomphe (Item Get!) ---
        // Se déclenche exactement au moment de l'impact au centre de l'écran (à 2.5s)
        const notesTriomphe = [523.25, 659.25, 783.99, 1046.50]; // Do5, Mi5, Sol5, Do6

        notesTriomphe.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0, t0 + dureeMontee);
            gain.gain.linearRampToValueAtTime(0.15, t0 + dureeMontee + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t0 + dureeMontee + 2.5); // Résonne longtemps

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t0 + dureeMontee);
            osc.stop(t0 + dureeMontee + 2.5);
        });
    }
}