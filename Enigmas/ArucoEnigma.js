import { Enigma } from './Enigma.js';

export class ArucoEnigma extends Enigma {
    constructor() {
        // On appelle le constructeur de la classe parente (Enigma)
        super("enigme_vrai-faux", "Aruco");

    }

    // Le GameEngine appelle cette fonction 15 fois par seconde
    checkCondition(playerState) {
        if (this.estResolu) return;
    }

    onSuccess() {
        // C'est ici que tu pourras dire au UIManager d'afficher la suite !
        console.log("🔓 Le cadenas Aruco est ouvert !");

        // Exemple d'action : 
        // document.getElementById("panel-aruco").style.display = "block";
    }
}