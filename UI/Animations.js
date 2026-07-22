import uiManagerInstance from './UIManager.js';

import { playTabUnlockingSound } from '../Utils/Audio/AudioSynth.js';

export class Animations {

    constructor() {
        this.cinematicOverlay = document.getElementById("unlock-cinematic");
        this.cinematicText = document.getElementById("cinematic-tab-name");
        this.cinematicContent = this.cinematicOverlay?.querySelector(".cinematic-content");

        this.btnWebcam = document.getElementById("webcamButton");
    }

    /**
    * Makes a fancy animation adn then show the button to access the tab of the enigma unlocked
    */
    launchUnlockingEnigmaAnimation(idOfNewTab) {
        const newTab = uiManagerInstance.tabManager.tabs[idOfNewTab];

        if (this.cinematicOverlay) {
            this.cinematicText.innerText = newTab.name;
            playTabUnlockingSound();

            this.cinematicOverlay.style.display = "flex";

            setTimeout(() => {
                this.cinematicOverlay.style.opacity = "1";
                this.cinematicContent.classList.add("cinematic-animate");
            }, 10);

            setTimeout(() => {
                this.cinematicOverlay.style.opacity = "0";

                setTimeout(() => {
                    this.cinematicOverlay.style.display = "none";
                    this.cinematicContent.classList.remove("cinematic-animate");

                    if (newTab.bouton) {
                        newTab.bouton.classList.add("unlock-animation");
                        setTimeout(() => newTab.bouton.classList.remove("unlock-animation"), 1500);
                    }
                }, 300);
            }, 5000);
        }
    }

    /**
         * Fait exploser les éléments de l'accueil un par un.
         * @returns {number} Le temps total (en ms) que va durer l'explosion.
         */
    launchAnimationOutOfWelcomePanel() {
        this.btnWebcam.innerText = "ACCÈS VALIDÉ...";
        this.btnWebcam.style.backgroundColor = "#ff5252";

        const welcomePanel = uiManagerInstance.tabManager.tabs['welcome'].panel;
        const welcomePanelElements = Array.from(welcomePanel.children);

        welcomePanelElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.15}s`;
            element.classList.add("explode-out");
        });

        //now the elements are invisible in css but we need them to really disapear => display to 'none'
        document.getElementById("panel-welcome").style.display = "none";
        return (welcomePanelElements.length * 150) + 600;
    }

}
