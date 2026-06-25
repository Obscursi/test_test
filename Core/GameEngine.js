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
        const lsfEnigma = new LsfEnigma();
        this.enigmas = [lsfEnigma]; // List of all enigmas we will do
        this.currentEnigmaIndex = 0; // index of the level we are doing (maybe we will need to change this if we have several enigmas at the same time)
        this.isRunning = false;

        this.listOfTabs = ["btn-tab-opencv"]; //here we put IN ORDER the list of tabs that we will unlock when the player is progressing EXCEPT those we already display at the beginning
        this.indexOfTab = 0;

        //to lower the fps rendering
        this.fpsTarget = 15;
        this.frameInterval = 1000 / this.fpsTarget;
        this.lastFrameTime = 0;
    }

    // Phase de démarrage asynchrone (pour attendre le chargement des gros fichiers)
    async init() {
        console.log("⚙️ GameEngine: Initialisation automatique du moteur...");

        // 3. NOUVEAUTÉ : On utilise l'UI pour montrer qu'on travaille
        this.uiManager.updateWebcamButton(false, false); // Bouton disabled "ATTENTE..."

        const inputsReady = await this.inputManager.init();

        if (!inputsReady) {
            console.error("🚨 GameEngine: Échec de l'IA.");
            this.uiManager.showError("Erreur fatale de l'IA. Vérifiez la console.");
            return;
        }

        // Initialisation des autres systèmes
        // this.uiManager.init();
        // this.networkManager.init();

        this.loadEnigmas();

        // 4. NOUVEAUTÉ : C'EST PRÊT ! On active le bouton pour l'utilisateur
        console.log("✅ GameEngine: Modèles IA chargés. Le bouton est actif !");
        this.uiManager.hideLoading();
        this.uiManager.updateWebcamButton(false, true); // Bouton actif "ACTIVER LA WEBCAM"
    }

    // Construit la ligne de progression de ton Escape Game
    loadEnigmas() {
        // C'est ici que tu brancheras tes futurs fichiers :
        // this.enigmas.push(new LsfEnigma());
        // this.enigmas.push(new ColorEnigma());

        console.log(`GameEngine: ${this.enigmas.length} énigmes chargées.`);
    }

    // Le bouton "Play"
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("🎮 GameEngine: Démarrage de la boucle principale.");

        // Si on a des énigmes, on lance la première
        if (this.enigmas.length > 0) {
            this.enigmas[this.currentEnigmaIndex].start();
        }
        // On initialise le chronomètre juste avant de lancer la boucle
        this.lastFrameTime = performance.now();
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    // La boucle principale (Heartbeat)
    // Le navigateur envoie automatiquement un 'timestamp' à la fonction
    //this time stamp is used to reduce the frequency of rendering, because this loop is called by requestAnimationFrame, which works at the frequency of usually 60Hz
    //sometimes more depending on the screen.
    loop() {
        if (!this.isRunning) return;

        // 1. On rappelle la boucle immédiatement pour le prochain cycle de l'écran
        requestAnimationFrame(() => this.loop());

        // --- ÉTAPE 1 : INPUT (Caméra, Dessin et IA) ---
        this.inputManager.update();
        const playerState = this.inputManager.getState();

        // --- ÉTAPE 2 : UPDATE (Logique) ---
        const currentEnigma = this.enigmas[this.currentEnigmaIndex];

        if (currentEnigma && !currentEnigma.estResolu) {
            currentEnigma.checkCondition(playerState);
        }
        else if (currentEnigma && currentEnigma.estResolu) {
            this.uiManager.unlockTab(this.listOfTabs[this.indexOfTab]); //we display the next tab for the next enigma
            this.indexOfTab++;
            this.nextEnigma();
        }


        // --- ÉTAPE 3 : RENDER (Interface) ---
        this.uiManager.updateGestureDebugText(playerState.gestures);
    }

    // Passage au niveau suivant
    nextEnigma() {
        this.currentEnigmaIndex++;
        if (this.currentEnigmaIndex < this.enigmas.length) {
            console.log(`GameEngine: 🔓 Niveau complété. Passage à l'énigme ${this.currentEnigmaIndex + 1}`);
            this.enigmas[this.currentEnigmaIndex].start();

            this.uiManager.afficherNotification("Niveau Suivant !");

        } else {
            console.log("GameEngine: 🏆 JEU TERMINÉ ! VICTOIRE !");
            this.isRunning = false; // On coupe la boucle, le jeu est fini
            this.uiManager.afficherEcranVictoire();
        }
    }
}