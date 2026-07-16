import uiManagerInstance from '../UI/UIManager.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';


export class WebcamButton {

    constructor() {
        this.btnWebcam = document.getElementById("webcamButton");
    }
    /**
     * Point d'entrée principal du clic sur le bouton de démarrage.
    */
    initWebcamButtonEvent() {

        if (!this.btnWebcam) return;

        this.btnWebcam.addEventListener('click', async () => {
            await this.prepareWebcamAutorisation();

            try {
                // Le navigateur met le code en pause ici pour demander la caméra
                await navigator.mediaDevices.getUserMedia({ video: true });

                // Si accepté, on lance la suite des animations
                const waitingTime = this.launchAnimationOutOfWelcomePanel();
                this.transitionToBeginningTab(waitingTime);

            } catch (erreur) {
                this.buttonChangeIfCameraAccessRefused(erreur);
            }
        });
    }

    /**
     * Modifie l'état du bouton et laisse le temps au navigateur de s'actualiser.
     */
    async prepareWebcamAutorisation() {
        this.btnWebcam.disabled = true;
        this.btnWebcam.innerText = "AUTORISATION REQUISE (VOIR POP-UP)...";
        this.btnWebcam.style.animation = "none";
        this.btnWebcam.style.backgroundColor = "#f57c00";

        // La fameuse micro-pause pour que le CSS s'applique avant la pop-up
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    /**
     * Fait exploser les éléments de l'accueil un par un.
     * @returns {number} Le temps total (en ms) que va durer l'explosion.
     */
    launchAnimationOutOfWelcomePanel() {
        this.btnWebcam.innerText = "ACCÈS VALIDÉ. SURCHARGE DU SAS...";
        this.btnWebcam.style.backgroundColor = "#ff5252";

        const welcomePanel = uiManagerInstance.tabManager.tabs['welcome'].panel;
        const welcomePanelElements = Array.from(welcomePanel.children);

        welcomePanelElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.15}s`;
            element.classList.add("explode-out");
        });

        //now the elements are invisible ins css but we need them to really disapear => display to 'none'
        document.getElementById("panel-welcome").style.display = "none";
        return (welcomePanelElements.length * 150) + 600;
    }

    /**
     * Bascule sur l'onglet LSF et lance l'éblouissement global de l'écran.
     * @param {number} delay - Le temps à attendre avant de lancer la transition.
     */
    transitionToBeginningTab(delay) {
        setTimeout(() => {
            // Nettoyage de la navigation
            const welcomeTab = document.querySelector('.tab-button[data-target="welcome"]');
            if (welcomeTab) welcomeTab.style.display = "none";

            uiManagerInstance.tabManager.tabs[ENIGMA_IDS.LSF].unlockTab();
            uiManagerInstance.tabManager.tabs[ENIGMA_IDS.COLORS].unlockTab();


            // Bascule sur le puzzle
            uiManagerInstance.tabManager.showTab(ENIGMA_IDS.LSF);
            uiManagerInstance.tabManager.showTab(ENIGMA_IDS.COLORS);



            // Activation visuelle de l'onglet LSF
            const lsfTab = document.querySelector('.tab-button[data-target="lsf"]');
            if (lsfTab) {
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                lsfTab.classList.add('active');
            }

            const colorsTab = document.querySelector('.tab-button[data-target="colors"]');
            if (colorsTab) {
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                colorsTab.classList.add('active');
            }

            // Allumage aveuglant du système
            document.body.classList.add("global-boot");

            // Nettoyage final pour ne pas polluer le DOM
            setTimeout(() => {
                document.body.classList.remove("global-boot");
            }, 3500);

        }, delay);
    }

    /**
     * Verrouille l'interface si l'utilisateur refuse la caméra.
     */
    buttonChangeIfCameraAccessRefused(erreur) {
        console.warn("Accès caméra refusé :", erreur);
        this.btnWebcam.innerText = "ACCÈS REFUSÉ. SYSTÈME VERROUILLÉ.";
        this.btnWebcam.style.backgroundColor = "#ff5252";
    }

}





