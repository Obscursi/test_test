import { Enigma } from './Enigma.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';


import inputManagerInstance from '../Inputs/InputManager.js';
import uiManagerInstance from '../UI/UIManager.js';


export class LsfEnigma extends Enigma {
    constructor() {
        // On appelle le constructeur de la classe parente (Enigma)
        super(ENIGMA_IDS.LSF, "Enigme LSF", [ENIGMA_IDS.ARUCO]); //this id (ENIGMA_IDS.LSF) is the same in UIManager, it is attached to the tab AND the Enigma 

        // Les 4 lettres qui doivent être vues en même temps
        //this.lettresRequises = ["P", "I", "E", "D"];
        this.lettresRequises = ["P", "I"];

        this.lsfTextBox = document.getElementById("lsf-sign-box"); //I will probably move it with updateGestureDebugText to a specific file, in the UI
    }

    update() {
        inputManagerInstance.update(this.id); //update the sign detected
        const playerState = inputManagerInstance.getState(); //get the list of signs detected
        this.checkCondition(playerState); //check if we have all the letter required

        this.updateGestureDebugText(playerState.gestures); //we update the box with the letters detected
    }

    // Le GameEngine appelle cette fonction 15 fois par seconde
    checkCondition(playerState) {
        if (this.isResolved) return;

        const gestesActuels = playerState.gestures; // Ex: ["P", "Thumb_Up", "I"]

        // if we don't see enough hands to form the word it is not useful to look further
        if (gestesActuels.length < this.lettresRequises.length) {
            return;
        }

        // On vérifie que TOUTES les lettres requises sont dans le tableau des gestes actuels
        const toutesPresentes = this.lettresRequises.every(lettre => gestesActuels.includes(lettre));

        if (toutesPresentes) {
            this.onSuccess();
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