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

            if (bouton) {
                // 1. On le rend visible (il doit s'afficher à côté des autres)
                bouton.style.display = "inline-block";

                // 2. On lance notre belle animation CSS
                bouton.classList.add("unlock-animation");

                // 3. On nettoie la classe une fois l'animation terminée pour éviter les bugs si on re-clique
                setTimeout(() => {
                    bouton.classList.remove("unlock-animation");
                }, 1500); // 1.5s correspond à la durée définie dans le CSS
            } else {
                this.showError("le bouton d'onglet n'a pas le bon id");
            }

            this.currentUnlockIndex++;
        }
    }
}