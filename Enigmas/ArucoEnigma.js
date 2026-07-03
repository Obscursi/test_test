import { Enigma } from './Enigma.js';

export class ArucoEnigma extends Enigma {
    constructor() {
        // On appelle le constructeur de la classe parente (Enigma)
        super("enigme_vrai-faux", "Aruco");

    }
    checkCondition(playerState) {
        if (this.estResolu) return;
    }

    onSuccess() {
        console.log("🔓 Le cadenas Aruco est ouvert !");
        uiManagerInstance.completeEnigma('aruco');
    }
}