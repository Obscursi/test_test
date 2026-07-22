import gameEngineInstance from '../Core/GameEngine.js';
import { ENIGMA_IDS } from '../../Utils/Constant.js';

import { showClueAlert } from './AlertManager.js';

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
}