import gameEngineInstance from '../Core/GameEngine.js';
import { ENIGMA_IDS } from '../../Utils/Constant.js';

import { showClueAlert } from './AlertManager.js';
import { playMysteriousSwell } from '../../Utils/Audio/AudioSynth.js';

export class TerminalManager {
    constructor() {
        this.btnOpen = document.getElementById('btn-open-terminal');
        this.btnClose = document.getElementById('btn-close-terminal');
        this.btnSubmit = document.getElementById('btn-submit-code');
        this.modal = document.getElementById('terminal-modal');
        this.inputField = document.getElementById('terminal-input');
        this.feedbackText = document.getElementById('terminal-feedback');

        this.initEventListeners();
    }

    initEventListeners() {
        if (!this.btnOpen) return; // Sécurité

        this.btnOpen.addEventListener('click', () => this.openTerminal());
        this.btnClose.addEventListener('click', () => this.closeTerminal());

        this.btnSubmit.addEventListener('click', () => this.processCode());

        // Permettre de valider avec la touche Entrée
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processCode();
        });
    }

    openTerminal() {
        this.modal.classList.remove('modal-hidden');
        this.inputField.value = ''; // On vide le champ
        this.feedbackText.innerText = '';
        this.inputField.focus();
    }

    closeTerminal() {
        this.modal.classList.add('modal-hidden');
    }

    processCode() {
        const codeText = this.inputField.value.trim().toLowerCase();

        switch (codeText) {
            case 'open_aruco':
                this.feedbackText.innerText = "Accès autorisé : Scanner Aruco déverrouillé.";
                this.feedbackText.style.color = "green";
                // Action : On débloque une énigme à distance
                gameEngineInstance.activateEnigmaWithAnimation(ENIGMA_IDS.ARUCO);
                setTimeout(() => this.closeTerminal(), 1500);
                break;
            case 'physique': // Le mot de passe choisi par le joueur
                this.feedbackText.innerText = "Code accepté. Déverrouillage en cours...";
                this.feedbackText.style.color = "green";

                // 1. On ferme le terminal après un court délai pour l'effet visuel
                setTimeout(() => this.closeTerminal(), 800);

                // 2. On affiche le pop-up d'indice une fois le terminal disparu
                setTimeout(() => {
                    showClueAlert("Bravo, tu as débloqué un nouvel indice physique !");
                }, 1200);
                break;
            default:
                this.feedbackText.innerText = "Code invalide. Accès refusé.";
                this.feedbackText.style.color = "red";
                this.inputField.value = '';
                break;
        }

    }

    /**
         * Fait apparaître le bouton avec son, glitch visuel et décryptage textuel
         */
    showTerminalButton() {
        if (!this.btnOpen) return;

        // 1. Affichage de base et application du glitch CSS
        this.btnOpen.style.display = 'block';

        // On retire puis remet la classe pour relancer l'animation si besoin
        this.btnOpen.classList.remove('mysterious-reveal');
        void this.btnOpen.offsetWidth; // Astuce pour forcer le navigateur à relire le CSS
        this.btnOpen.classList.add('mysterious-reveal');

        // 2. Lancement du son généré
        playMysteriousSwell();

        // 3. Effet de Scramble (Décryptage de caractères)
        const finalString = "💻 TERMINAL";
        const randomChars = "01$!*@#%&ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let iterations = 0;

        // Toutes les 40ms, on change les lettres
        const interval = setInterval(() => {
            this.btnOpen.innerText = finalString.split('').map((letter, index) => {
                // Si l'index est inférieur aux itérations, on affiche la vraie lettre
                if (index < Math.floor(iterations)) return finalString[index];

                // Sinon, on affiche un caractère aléatoire
                return randomChars[Math.floor(Math.random() * randomChars.length)];
            }).join('');

            // Condition d'arrêt
            if (iterations >= finalString.length) {
                clearInterval(interval);
            }

            // Vitesse du décryptage (plus le chiffre est bas, plus c'est long)
            iterations += 1 / 3;
        }, 40);

        console.log("👽 TerminalManager : Unité inconnue détectée sur le réseau.");
    }

    /**
     * NOUVELLE FONCTION : Recache le bouton si besoin
     */
    hideTerminalButton() {
        if (this.btnOpen) {
            this.btnOpen.style.display = 'none';
        }
    }

}