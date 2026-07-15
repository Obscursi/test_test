import { Enigma } from './Enigma.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';



export class ArucoEnigma extends Enigma {
    constructor() {
        // On appelle le constructeur de la classe parente (Enigma)
        super(ENIGMA_IDS.ARUCO, "Aruco vrai/faux");

    }

}