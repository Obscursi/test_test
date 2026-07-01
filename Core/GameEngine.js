import { InputManager } from '../Inputs/InputManager.js';
import { UIManager } from '../UI/UIManager.js';
import { LsfEnigma } from '../Enigmas/LsfEnigma.js';
// import { NetworkManager } from '../Network/NetworkManager.js';

export class GameEngine {
    constructor() {
        // 1. Instanciation des Managers
        this.inputManager = new InputManager();
        this.uiManager = new UIManager();
        // this.networkManager = new NetworkManager();

        // 2. État global du jeu

        this.listOfEnigmas = []; // ordered list of all enigmas we will do 
        this.currentEnigmaIndex = 0; // index of the level we are doing (maybe we will need to change this if we have several enigmas at the same time)
        this.isRunning = false;

        //to lower the fps rendering (not used because it works well for now without it)
        // this.fpsTarget = 15;
        // this.frameInterval = 1000 / this.fpsTarget;
        // this.lastFrameTime = 0;
    }

    // asynchronous initialisation (async waits for the files to load instead of interpreting the lines of code without stopping)
    async init() {
        console.log("⚙️ GameEngine: Initialisation automatique du moteur...");


        this.uiManager.updateWebcamButton(false, false); // Bouton disabled "ATTENTE..."

        const inputsReady = await this.inputManager.init();

        if (!inputsReady) {
            console.error("🚨 GameEngine: Échec de l'IA.");
            this.uiManager.showError("Erreur fatale de l'IA. Vérifiez la console.");
            return;
        }

        // Initialisation des autres systèmes
        // this.networkManager.init();

        this.loadEnigmas();

        console.log("✅ GameEngine: Modèles IA chargés. Le bouton est actif !");
        this.uiManager.hideLoading();
        this.uiManager.updateWebcamButton(false, true); // We make the webcam button ready
    }

    //here we load all the enigmas in the list IN ORDER
    loadEnigmas() {
        this.listOfEnigmas.push(new LsfEnigma());
        console.log(`GameEngine: ${this.listOfEnigmas.length} énigmes chargées.`);
    }

    // Le bouton "Play"
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("🎮 GameEngine: Démarrage de la boucle principale.");

        // Si on a des énigmes, on lance la première
        if (this.listOfEnigmas.length > 0) {
            this.listOfEnigmas[this.currentEnigmaIndex].start();
        }
        // On initialise le chronomètre juste avant de lancer la boucle
        this.lastFrameTime = performance.now();
        requestAnimationFrame(() => this.loop());
    }

    // The main loop, heartbeat of the program
    // THIS IS NOT ACTUALLY USED : (this time stamp is used to reduce the frequency of rendering, because this loop is called by requestAnimationFrame, which works at the frequency of usually 60Hz
    //sometimes more depending on the screen).
    loop() {
        if (!this.isRunning) return;


        // 1. On rappelle la boucle immédiatement pour le prochain cycle de l'écran
        requestAnimationFrame(() => this.loop());

        // --- ÉTAPE 1 : INPUT (Caméra, Dessin et IA) ---
        this.inputManager.update();
        const playerState = this.inputManager.getState();

        // --- ÉTAPE 2 : UPDATE (Logique) ---
        const currentEnigma = this.listOfEnigmas[this.currentEnigmaIndex];

        if (currentEnigma && !currentEnigma.estResolu) {
            currentEnigma.checkCondition(playerState);
        }
        else if (currentEnigma && currentEnigma.estResolu) {
            this.uiManager.unlockNextTabButton();
            this.nextEnigma();
        }


        // --- ÉTAPE 3 : RENDER (Interface) ---
        this.uiManager.updateGestureDebugText(playerState.gestures);
    }

    // Passage au niveau suivant
    nextEnigma() {
        this.currentEnigmaIndex++;
        if (this.currentEnigmaIndex < this.listOfEnigmas.length) {
            console.log(`GameEngine: 🔓 Niveau complété. Passage à l'énigme ${this.currentEnigmaIndex + 1}`);
            this.listOfEnigmas[this.currentEnigmaIndex].start();

            this.uiManager.showNotification("Niveau Suivant !");

        } else {
            console.log("GameEngine: 🏆 JEU TERMINÉ ! VICTOIRE !");
            this.isRunning = false; // On coupe la boucle, le jeu est fini
            this.uiManager.showVictoryScreen();
        }
    }
}