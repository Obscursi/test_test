import uiManagerInstance from '../UIManager.js';
import { ENIGMA_IDS } from '../../Utils/Constant.js';

export class PanelWelcome {
    constructor() {

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
}