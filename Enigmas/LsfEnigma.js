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
    }

    update() {
        inputManagerInstance.update(this.id); //update the sign detected
        const playerState = inputManagerInstance.getState(); //get the list of signs detected
        this.checkCondition(playerState); //check if we have all the letter required

        uiManagerInstance.panelManager.panelLsf.updateGestureDebugText(playerState.gestures); //we update the box with the letters detected
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


}