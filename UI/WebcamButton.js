export class WebcamButton {

    constructor() {
        this.btnCamera = document.getElementById("cameraButton"); // allume la caméra
        this.btnWebcam = document.getElementById("webcamButton"); // lance la mission

        this.webcamContainer = document.getElementById("webcam-container");
    }

    /**
     * Point d'entrée principal du clic sur le bouton de démarrage.
     * La promesse ne se résout qu'au clic : le code appelant (UIManager) est mis en pause
     * jusqu'à ce que l'équipe ait fini de cadrer le plateau.
     */
    initWebcamButtonEvent() {
        if (!this.btnWebcam) return Promise.reject("Bouton introuvable");

        return new Promise((resolve) => {
            this.btnWebcam.addEventListener('click', () => resolve(true), { once: true });
        });
    }

    /**
     * Appelé au clic sur le bouton caméra. La balise <video> est en autoplay :
     * afficher son conteneur suffit à voir l'image, il n'y a rien à attendre.
     */
    showWebcamFeed() {
        this.webcamContainer.style.display = "block";

        this.btnWebcam.disabled = false; //la mission ne peut partir qu'une fois la caméra allumée
    }

    /**
 * Modifies the visuel state of the webcam button depending or wheter or not it is activated
 * (c'est le bouton caméra qui attend l'IA : c'est par lui que l'accueil commence)
 */
    updateWebcamButton(isRunning, isReady = true) {
        if (!isReady) {
            this.btnCamera.disabled = true;
            this.btnCamera.innerText = "ATTENTE DU CHARGEMENT...";
            return;
        }

        // L'IA est prête, le bouton s'allume !
        this.btnCamera.disabled = false;
        this.btnCamera.innerText = "ALLUMER LA CAMÉRA";
    }

}
