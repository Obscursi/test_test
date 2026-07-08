import { Enigma } from './Enigma.js';


export class LsfEnigma extends Enigma {
    constructor() {
        // On appelle le constructeur de la classe parente (Enigma)
        super('lsf', "Enigme LSF", ['aruco']); //this id ('lsf') is the same in UIManager, it is attached to the tab AND the Enigma 

        // Les 4 lettres qui doivent être vues en même temps
        //this.lettresRequises = ["P", "I", "E", "D"];
        this.lettresRequises = ["P", "I"];
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