import { InputManager } from '../Inputs/InputManager.js';
import uiManagerInstance from '../UI/UIManager.js';
import { LsfEnigma } from '../Enigmas/LsfEnigma.js';
import { ArucoEnigma } from '../Enigmas/ArucoEnigma.js';
import { ColorsEnigma } from '../Enigmas/ColorsEnigma.js';
import { playTabUnlockingSound } from '../Utils/AudioSynth.js';
// import { NetworkManager } from '../Network/NetworkManager.js';

class GameEngine {
    constructor() {
        // 1. Instanciation des Managers
        this.inputManager = new InputManager();


        // this.networkManager = new NetworkManager();

        // 2. État global du jeu
        this.catalogueEnigmes = {};

        // 2. LE POOL ACTIF (Uniquement les énigmes que le joueur est en train de résoudre)
        this.activeEnigmas = [];

        this.isRunning = false;
        this.isTransitioning = false;

        //to lower the fps rendering (not used because it works well for now without it)
        // this.fpsTarget = 15;
        // this.frameInterval = 1000 / this.fpsTarget;
        // this.lastFrameTime = 0;
    }

    /**
     * Injecte OpenCV dans la page avec un bouclier anti-conflit pour la mémoire
     */
    async loadOpenCV() {
        return new Promise((resolve, reject) => {
            console.log("⏳ Début du téléchargement sécurisé d'OpenCV...");

            if (window.cv && window.cv.Mat) {
                resolve();
                return;
            }

            // ==============================================================
            // LE BOUCLIER : On cache temporairement la mémoire de MediaPipe
            // pour éviter qu'OpenCV ne l'écrase ou s'emmêle les pinceaux.
            // ==============================================================
            const memoireMediaPipe = window.Module;
            window.Module = undefined;

            // On crée l'import dynamiquement
            const script = document.createElement('script');
            script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
            script.type = 'text/javascript';

            script.onload = () => {
                const checkInterval = setInterval(() => {
                    // OpenCV est prêt quand l'objet cv et ses fonctions (Mat) existent
                    if (window.cv && window.cv.Mat) {
                        clearInterval(checkInterval);

                        // On restaure la mémoire de MediaPipe maintenant qu'OpenCV est installé
                        if (memoireMediaPipe !== undefined) {
                            window.Module = memoireMediaPipe;
                        }

                        console.log("👁️ OpenCV est totalement initialisé !");
                        resolve();
                    }
                }, 100);
            };

            script.onerror = () => {
                reject(new Error("Impossible de charger le script OpenCV.js"));
            };

            document.body.appendChild(script);
        });
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

        try {
            await this.loadOpenCV();
        } catch (error) {
            console.error("🚨 Échec d'OpenCV.", error);
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
        const lsf = new LsfEnigma();
        const aruco = new ArucoEnigma();
        const colors = new ColorsEnigma();

        this.catalogueEnigmes[lsf.id] = lsf;
        this.catalogueEnigmes[aruco.id] = aruco;
        this.catalogueEnigmes[colors.id] = colors;

        console.log(`GameEngine: ${Object.keys(this.catalogueEnigmes).length} énigmes chargées dans le catalogue.`);

    }

    // Le bouton "Play"
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("🎮 GameEngine: Démarrage de la boucle principale.");

        //here we put the starter enigmas
        this.activateEnigma('lsf');
        this.activateEnigma('colors');

        requestAnimationFrame(() => this.loop());
    }

    /**
     * Ajoute une énigme au cycle de mise à jour (Loop).
     */
    activateEnigma(idEnigma) {
        const enigma = this.catalogueEnigmes[idEnigma];
        if (enigma && !this.activeEnigmas.includes(enigma)) {
            enigma.start(); // S'il y a des choses à initialiser dans la classe
            this.activeEnigmas.push(enigma);
            console.log(`▶️ Énigme [${idEnigma}] ajoutée au pool actif.`);
        }
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

        // --- ÉTAPE 2 : UPDATE (La magie de l'architecture) ---
        if (!this.isTransitioning) {
            // On vérifie UNIQUEMENT les énigmes actives.
            // S'il y en a 2 en parallèle, les 2 seront vérifiées en même temps !
            this.activeEnigmas.forEach(currentEnigma => {
                if (!currentEnigma.isResolved && uiManagerInstance.tabs[currentEnigma.id].activeOrNot) { //we check the condition ONLY IF the tab if active 
                    currentEnigma.checkCondition(playerState);
                } else if (currentEnigma.isResolved) {
                    // Si elle est résolue pendant ce tour de boucle, on valide
                    this.completeEnigma(currentEnigma.id);
                }
            });
        }


        // --- ÉTAPE 3 : RENDER (Interface) ---
        uiManagerInstance.updateGestureDebugText(playerState.gestures);
    }


    /**
    * Change the status of an enigma to 'resolved'
    * @param {string} idEnigma
    */
    completeEnigma(idEnigma, enigmasToUnlock = []) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const tabCompleted = uiManagerInstance.tabs[idEnigma];

        // Security
        if (!tabCompleted || tabCompleted.status === 'resolved') {
            console.log("DEBUG GameEngine, completeEnigma : tabCompleted : ${tabCompleted} et tabCompleted.status : ${tabCompleted.status}");
            this.isTransitioning = false;
            return;
        }

        // We change the status to resolved for the tab (and completed for the button of the tab, which changes its color to green)
        tabCompleted.makeTabCompleted();

        playTabUnlockingSound();

        this.activeEnigmas = this.activeEnigmas.filter(enigme => enigme.id !== idEnigma);

        enigmasToUnlock.forEach(nextId => {
            uiManagerInstance.launchUnlockingAnimation(nextId);
            this.activateEnigma(nextId);
        });


        this.checkFinalVictory();

        this.isTransitioning = false;
    }

    /**
     * Le moteur ne vérifie plus que LA condition de victoire du jeu.
     */
    checkFinalVictory() {
        const arucoFini = uiManagerInstance.tabs['aruco'].statut === 'resolu';
        // const chemin2Fini = uiManagerInstance.onglets['enigmeChemin2'].statut === 'resolu';

        if (arucoFini /* && chemin2Fini */) {
            uiManagerInstance.launchUnlockingAnimation('victoire');
            this.isRunning = false;
        }
    }

}

const gameEngineInstance = new GameEngine();
export default gameEngineInstance;