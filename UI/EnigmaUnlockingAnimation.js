import uiManagerInstance from '../UI/UIManager.js';

import { playTabUnlockingSound } from '../Utils/AudioSynth.js';

export class EnigmaUnlockingAnimation {

    constructor() {
        this.cinematicOverlay = document.getElementById("unlock-cinematic");
        this.cinematicText = document.getElementById("cinematic-tab-name");
        this.cinematicContent = this.cinematicOverlay?.querySelector(".cinematic-content");
    }

    /**
    * Makes a fancy animation adn then show the button to access the tab of the enigma unlocked
    */
    launchUnlockingAnimation(idOfNewTab) {
        const newTab = uiManagerInstance.tabManager.tabs[idOfNewTab];
        if (!newTab) return;

        newTab.unlockTab();
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
}
