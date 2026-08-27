import gameEngineInstance from './GameLogic/GameEngine.js';
import uiManagerInstance from './UI/UIManager.js';
import inputManagerInstance from './Inputs/InputManager.js';

// On attend que la page HTML soit dessinée
window.addEventListener("DOMContentLoaded", async () => {

    // Les clics de l'accueil sont gérés par UIManager.initBeginningOfTheGame() :
    // le bouton allume la caméra au 1er clic, puis lance la mission au 2e.
    await gameEngineInstance.init();

    const btnCamera = document.getElementById("cameraButton");
    const btnWebcam = document.getElementById("webcamButton");

    // Un bouton pour allumer la caméra : le navigateur demande l'autorisation, puis on affiche
    // le flux pour que l'équipe cadre le plateau de jeu.
    btnCamera.addEventListener("click", () => {
        inputManagerInstance.toggleWebcam();
        uiManagerInstance.webcamButton.showWebcamFeed();
    });

    // Un bouton pour commencer le jeu : la caméra tourne déjà, il ne reste que la boucle à lancer.
    // (le UIManager écoute lui aussi ce clic, pour la transition hors de l'accueil)
    btnWebcam.addEventListener("click", () => {
        gameEngineInstance.start();
    });
});
