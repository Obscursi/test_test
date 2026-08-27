import gameEngineInstance from './GameLogic/GameEngine.js';
import uiManagerInstance from './UI/UIManager.js';

// On attend que la page HTML soit dessinée
window.addEventListener("DOMContentLoaded", async () => {

    // Les clics de l'accueil sont gérés par UIManager.initBeginningOfTheGame() :
    // le bouton allume la caméra au 1er clic, puis lance la mission au 2e.
    await gameEngineInstance.init();
});
