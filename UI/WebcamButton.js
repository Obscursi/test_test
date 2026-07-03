import uiManagerInstance from '../UI/UIManager.js';

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
            await this.preparerAutorisationWebcam();

            try {
                // Le navigateur met le code en pause ici pour demander la caméra
                await navigator.mediaDevices.getUserMedia({ video: true });

                // Si accepté, on lance la suite des animations
                const tempsAttente = this.declencherExplosionSas();
                this.transitionnerVersJeu(tempsAttente);

            } catch (erreur) {
                this.gererRefusWebcam(erreur);
            }
        });
    }

    /**
     * Modifie l'état du bouton et laisse le temps au navigateur de s'actualiser.
     */
    async preparerAutorisationWebcam() {
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
    declencherExplosionSas() {
        this.btnWebcam.innerText = "ACCÈS VALIDÉ. SURCHARGE DU SAS...";
        this.btnWebcam.style.backgroundColor = "#ff5252";

        const welcomePanel = uiManagerInstance.tabs['welcome'].panel;
        const elementsAccueil = Array.from(welcomePanel.children);

        elementsAccueil.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.15}s`;
            element.classList.add("explode-out");
        });

        // Calcul du temps total de l'animation
        if (this.btnWebcam) {
            this.btnWebcam.style.display = "none";
        }
        document.getElementById("panel-welcome").style.display = "none";
        return (elementsAccueil.length * 150) + 600;
    }

    /**
     * Bascule sur l'onglet LSF et lance l'éblouissement global de l'écran.
     * @param {number} delai - Le temps à attendre avant de lancer la transition.
     */
    transitionnerVersJeu(delai) {
        setTimeout(() => {
            // Nettoyage de la navigation
            const ongletAccueil = document.querySelector('.tab-button[data-target="welcome"]');
            if (ongletAccueil) ongletAccueil.style.display = "none";

            uiManagerInstance.tabs['lsf'].debloquer();

            // Bascule sur le puzzle
            uiManagerInstance.showTab('lsf');

            // Activation visuelle de l'onglet LSF
            const ongletLsf = document.querySelector('.tab-button[data-target="lsf"]');
            if (ongletLsf) {
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                ongletLsf.classList.add('active');
            }

            // Allumage aveuglant du système
            document.body.classList.add("global-boot");

            // Nettoyage final pour ne pas polluer le DOM
            setTimeout(() => {
                document.body.classList.remove("global-boot");
            }, 3500);

        }, delai);
    }

    /**
     * Verrouille l'interface si l'utilisateur refuse la caméra.
     */
    gererRefusWebcam(erreur) {
        console.warn("Accès caméra refusé :", erreur);
        this.btnWebcam.innerText = "ACCÈS REFUSÉ. SYSTÈME VERROUILLÉ.";
        this.btnWebcam.style.backgroundColor = "#ff5252";
    }

}





