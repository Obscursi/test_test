import inputManagerInstance from '../Inputs/InputManager.js';


export class WebcamButton {

    constructor() {
        this.btnWebcam = document.getElementById("webcamButton");
        this.webcamContainer = document.getElementById("webcam-container");

        //le bouton change de rôle au fil des clics : il faut donc retenir où on en est
        this.cameraAllumee = false;
    }

    /**
     * Point d'entrée principal du clic sur le bouton de démarrage. Le même bouton sert deux fois :
     *   1er clic : il n'allume que la caméra, le temps que l'équipe cadre le plateau de jeu ;
     *   2e clic  : il lance la mission.
     * La promesse ne se résout donc qu'au deuxième clic : le code appelant (UIManager) reste
     * en pause tant que le cadrage n'est pas validé.
     */
    initWebcamButtonEvent() {
        if (!this.btnWebcam) return Promise.reject("Bouton introuvable");

        return new Promise((resolve) => {

            this.btnWebcam.addEventListener('click', () => {

                if (!this.cameraAllumee) {
                    this.showWebcamFeed();
                    return; //on ne résout pas : la mission n'est pas encore lancée
                }

                resolve(true);
            });
        });
    }

    /**
     * 1er clic : la balise <video> est en autoplay, afficher son conteneur suffit à voir l'image.
     * Le bouton change alors d'étiquette pour proposer le vrai départ de la mission.
     */
    showWebcamFeed() {
        this.cameraAllumee = true;

        inputManagerInstance.toggleWebcam(); //c'est ici que le navigateur demande l'autorisation
        this.webcamContainer.style.display = "block";

        this.btnWebcam.innerText = "DÉMARRER LA MISSION";
    }

    /**
 * Modifies the visuel state of the webcam button depending or wheter or not it is activated
 */
    updateWebcamButton(isRunning, isReady = true) {
        if (!isReady) {
            this.btnWebcam.disabled = true;
            this.btnWebcam.innerText = "ATTENTE DU CHARGEMENT...";
            return;
        }

        // L'IA est prête, le bouton s'allume ! Il n'allume d'abord que la caméra.
        this.btnWebcam.disabled = false;
        this.btnWebcam.innerText = "ALLUMER LA CAMÉRA";
    }

}
