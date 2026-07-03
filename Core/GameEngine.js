import { InputManager } from '../Inputs/InputManager.js';
import uiManagerInstance from '../UI/UIManager.js';
import { LsfEnigma } from '../Enigmas/LsfEnigma.js';
import { ArucoEnigma } from '../Enigmas/ArucoEnigma.js';
import { playTabUnlockingSound } from '../Utils/AudioSynth.js';
// import { NetworkManager } from '../Network/NetworkManager.js';

class GameEngine {
    constructor() {
        // 1. Instanciation des Managers
        this.inputManager = new InputManager();


        // this.networkManager = new NetworkManager();

        // 2. État global du jeu

        this.listOfEnigmas = []; // ordered list of all enigmas we will do 
        this.currentEnigmaIndex = 0; // index of the level we are doing (maybe we will need to change this if we have several enigmas at the same time)
        this.isRunning = false;

        this.isTransitioning = false;

        //to lower the fps rendering (not used because it works well for now without it)
        // this.fpsTarget = 15;
        // this.frameInterval = 1000 / this.fpsTarget;
        // this.lastFrameTime = 0;
    }

    // asynchronous initialisation (async waits for the files to load instead of interpreting the lines of code without stopping)
    async init() {
        console.log("⚙️ GameEngine: Initialisation automatique du moteur...");


        uiManagerInstance.updateWebcamButton(false, false); // Bouton disabled "ATTENTE..."

        const inputsReady = await this.inputManager.init();

        if (!inputsReady) {
            console.error("🚨 GameEngine: Échec de l'IA.");
            uiManagerInstance.showError("Erreur fatale de l'IA. Vérifiez la console.");
            return;
        }

        // Initialisation des autres systèmes
        // this.networkManager.init();

        this.loadEnigmas();

        console.log("✅ GameEngine: Modèles IA chargés. Le bouton est actif !");
        uiManagerInstance.hideLoading();
        uiManagerInstance.updateWebcamButton(false, true); // We make the webcam button ready
    }

    //here we load all the enigmas in the list IN ORDER
    loadEnigmas() {
        this.listOfEnigmas.push(new LsfEnigma());
        this.listOfEnigmas.push(new ArucoEnigma());
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
        requestAnimationFrame(() => this.loop());
    }

    // The main loop, heartbeat of the program
    // in the future may need to limit the refreshrate of this loop. Actually it is 60Hz, but it depends on the screen you are using
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
            this.nextEnigma();
        }


        // --- ÉTAPE 3 : RENDER (Interface) ---
        uiManagerInstance.updateGestureDebugText(playerState.gestures);
    }

    // Passage au niveau suivant
    nextEnigma() {
        this.currentEnigmaIndex++;
        if (this.currentEnigmaIndex < this.listOfEnigmas.length) {
            console.log(`GameEngine: 🔓 Niveau complété. Passage à l'énigme ${this.currentEnigmaIndex + 1}`);
            this.listOfEnigmas[this.currentEnigmaIndex].start();

            uiManagerInstance.showNotification("Niveau Suivant !");

        } else {
            console.log("GameEngine: 🏆 JEU TERMINÉ ! VICTOIRE !");
            this.isRunning = false; // On coupe la boucle, le jeu est fini
            uiManagerInstance.showVictoryScreen();
        }
    }

    /**
    * Appelé par ton GameEngine quand une énigme spécifique est réussie.
    * @param {string} idEnigme - L'ID de l'énigme (ex: 'lsf' ou 'aruco')
    */
    completeEnigma(idEnigme) {
        const tabCompleted = uiManagerInstance.tabs[idEnigme];

        // Si l'onglet n'existe pas ou est déjà résolu, on ignore
        if (!tabCompleted || tabCompleted.status === 'resolved') return;

        // 1. On passe l'onglet en Vert
        tabCompleted.makeTabCompleted();

        // Petit effet sonore pour confirmer la réussite d'une étape
        playTabUnlockingSound();

        // 2. On vérifie si cela débloque de nouvelles choses
        this.globalProgression();
    }

    /**
        * Le "Cerveau" : vérifie l'état de tous les onglets pour voir si on avance.
        */
    globalProgression() {
        const lsfFinished = uiManagerInstance.tabs['lsf'].status === 'resolved';
        const arucoFinished = uiManagerInstance.tabs['aruco'].status === 'resolved';
        const victoryLocked = uiManagerInstance.tabs['victoire'].status === 'locked';

        // RÈGLE PARALLÈLE : Si les deux chemins sont terminés, on débloque la Victoire
        if (lsfFinished && arucoFinished && victoryLocked) {
            uiManagerInstance.launchUnlockingAnimation('victoire');
        }

        if (lsfFinished && !arucoFinished) { uiManagerInstance.launchUnlockingAnimation('aruco'); console.log("aruco unlock"); }

        // Tu pourras ajouter d'autres règles ici plus tard si tu ajoutes des énigmes !
        // Exemple : if (lsfFini && !arucoFini) { this.launchUnlockingAnimation('aruco'); }
    }

}

const gameEngineInstance = new GameEngine();
export default gameEngineInstance;