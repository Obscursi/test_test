// main.js (À la racine)
import { GameEngine } from './Core/GameEngine.js';

// On attend que la page HTML soit dessinée
window.addEventListener("DOMContentLoaded", async () => {
    console.log("oui");
    // 1. On instancie le moteur
    const game = new GameEngine();

    // 2. CORRECTION : On lance le chargement IA IMMÉDIATEMENT et automatiquement
    await game.init();

    const btnWebcam = document.getElementById("webcamButton");

    // 3. Le clic ne gère plus que l'accès caméra (sécurité) et le lancement de la boucle
    btnWebcam.addEventListener("click", () => {

        // On récupère l'état AVANT le clic pour savoir ce qu'on fait
        const currentlyRunning = game.inputManager.vision.webcamRunning;

        // On bascule l'état de la caméra
        game.inputManager.toggleWebcam();

        // On met à jour l'interface visuellement.
        // Si c'était coupé (currentlyRunning = false), on s'attend à ce que ça s'active (true)
        const newState = !currentlyRunning;
        game.uiManager.updateWebcamButton(newState);

        // Si on vient d'activer la caméra, on lance la boucle du jeu
        if (newState) {
            game.start();
        }
    });
});