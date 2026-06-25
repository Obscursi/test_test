import { Enigma } from './Enigma.js';

export class LsfEnigma extends Enigma {
    constructor() {
        // On appelle le constructeur de la classe parente (Enigma)
        super("enigme_lsf", "Le Mot de Passe Multijoueur");

        // Les 4 lettres qui doivent être vues en même temps
        //this.lettresRequises = ["P", "I", "E", "D"];
        this.lettresRequises = ["P", "I"];
    }

    // Le GameEngine appelle cette fonction 15 fois par seconde
    checkCondition(playerState) {
        if (this.estResolu) return;

        const gestesActuels = playerState.gestures; // Ex: ["P", "Thumb_Up", "I"]

        // if we don't see enough hands to form the word it is not useful to look further
        if (gestesActuels.length < this.lettresRequises.length) {
            return;
        }

        // On vérifie que TOUTES les lettres requises sont dans le tableau des gestes actuels
        const toutesPresentes = this.lettresRequises.every(lettre => gestesActuels.includes(lettre));

        if (toutesPresentes) {
            this.unlock();
        }
    }

    onSuccess() {
        // C'est ici que tu pourras dire au UIManager d'afficher la suite !
        console.log("🔓 Le cadenas LSF est ouvert !");

        // Exemple d'action : 
        // document.getElementById("panel-opencv").style.display = "block";
    }
}