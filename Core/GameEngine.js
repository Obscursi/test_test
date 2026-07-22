import inputManagerInstance from '../Inputs/InputManager.js';
import uiManagerInstance from '../UI/UIManager.js';
import { LsfEnigma } from '../Enigmas/LsfEnigma.js';
import { ArucoEnigma } from '../Enigmas/ArucoEnigma.js';
import { ColorsEnigma } from '../Enigmas/ColorsEnigma.js';
// import { NetworkManager } from '../Network/NetworkManager.js';
import { ENIGMA_STATUS } from '../Utils/Constant.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';

import { showError } from '../UI/AlertManager.js';
import { showVictoryScreen } from '../UI/AlertManager.js';

class GameEngine {
    constructor() {
        // this.networkManager = new NetworkManager();

        // 2. État global du jeu
        this.dictionnaryOfEnigmas = {};

        // 2. LE POOL ACTIF (Uniquement les énigmes que le joueur est en train de résoudre)
        this.activeEnigmas = [];

        this.isRunning = false;
        this.isTransitioning = false;

        //to lower the fps rendering (not used because it works well for now without it)
        // this.fpsTarget = 10;
        // this.frameInterval = 1000 / this.fpsTarget;
        // this.lastFrameTime = 0;
    }

    // asynchronous initialisation (async waits for the files to load instead of interpreting the lines of code without stopping)
    async init() {
        console.log("⚙️ GameEngine: Initialisation automatique du moteur...");
        uiManagerInstance.webcamButton.updateWebcamButton(false, false); // Bouton disabled "ATTENTE..."

        const inputsReady = await inputManagerInstance.init();

        if (!inputsReady) {
            console.error("🚨 GameEngine: Échec de l'IA.");
            showError("Erreur fatale de l'IA. Vérifiez la console.");
            return;
        }

        // Initialisation des autres systèmes
        // this.networkManager.init();

        this.loadEnigmas();

        console.log("✅ GameEngine: Modèles IA chargés. Le bouton est actif !");
        uiManagerInstance.hideLoading();
        uiManagerInstance.webcamButton.updateWebcamButton(false, true); // We make the webcam button ready
    }

    //here we load all the enigmas in the list IN ORDER
    loadEnigmas() {
        const lsf = new LsfEnigma();
        const aruco = new ArucoEnigma();
        const colors = new ColorsEnigma();

        this.dictionnaryOfEnigmas[lsf.id] = lsf;
        this.dictionnaryOfEnigmas[aruco.id] = aruco;
        this.dictionnaryOfEnigmas[colors.id] = colors;

        console.log(`GameEngine: ${Object.keys(this.dictionnaryOfEnigmas).length} énigmes chargées dans le dictionnaire.`);

    }

    // Le bouton "Play"
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("🎮 GameEngine: Démarrage de la boucle principale.");

        this.putEnigmaIntoTheActivePool(ENIGMA_IDS.COLORS); //we let the logic of the UI, (so that the buttons of the tabs does not show in the animation)
        this.putEnigmaIntoTheActivePool(ENIGMA_IDS.LSF);    //so we activate the buttons in transitionToBeginningTab()



        requestAnimationFrame(() => this.loop());
    }

    /**
     *  Add an enigma to the active pool of enigmas with an animation
     */
    activateEnigmaWithAnimation(idEnigma) {
        uiManagerInstance.unlockNewTabWithAnimations(idEnigma);
        this.putEnigmaIntoTheActivePool(idEnigma);
    }

    /**
    * Add an enigma to the active pool of enigmas. The Ui part shows the button of the enigma while the rest is the game logic which activates the logic of the game (not ui realted)
    */
    activateEnigmaWithoutAnimation(idEnigma) {
        uiManagerInstance.unlockNewTabWithoutAnimations(idEnigma);
        this.putEnigmaIntoTheActivePool(idEnigma);
    }

    putEnigmaIntoTheActivePool(idEnigma) {
        const enigma = this.dictionnaryOfEnigmas[idEnigma];
        if (enigma && !this.activeEnigmas.includes(enigma)) {
            enigma.start(); // S'il y a des choses à initialiser dans la classe
            this.activeEnigmas.push(enigma);
            console.log(`▶️ Énigme [${idEnigma}] ajoutée au pool actif.`);
        } else {
            console.log("DEBUG : could not activate this enigma");
        }
    }

    // The main loop, heartbeat of the program
    // in the future may need to limit the refreshrate of this loop. Actually it is 60Hz, but it depends on the screen you are using
    loop() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.loop());

        if (!this.isTransitioning) {
            this.activeEnigmas.forEach(currentEnigma => {
                const tab = uiManagerInstance.tabManager.tabs[currentEnigma.id];

                if (tab && tab.activeOrNot === true) { // we update only if the tab is active (id est open)
                    if (!currentEnigma.isResolved) {

                        currentEnigma.update();

                    } else if (currentEnigma.isResolved) { // else if for security you never know in javascript

                        this.completeEnigma(currentEnigma.id);

                    }
                } else if (!tab) {
                    console.log("GameEngine DEBUG : tab n'a pas été trouvé");
                }
            });
        }
    }


    /**
    * Change the status of an enigma to ENIGMA_STATUS.RESOLVED
    * @param {string} idEnigma
    */
    completeEnigma(idEnigma, enigmasToUnlock = []) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const tabCompleted = uiManagerInstance.tabManager.tabs[idEnigma];

        // Security
        if (!tabCompleted || tabCompleted.status === ENIGMA_STATUS.RESOLVED) {
            console.log(`DEBUG GameEngine, completeEnigma : tabCompleted : ${tabCompleted} et tabCompleted.status : ${tabCompleted.status}`);
            this.isTransitioning = false;
            return;
        }

        // We change the status to resolved for the tab (and completed for the button of the tab, which changes its color to green)
        tabCompleted.makeTabCompleted();

        this.activeEnigmas = this.activeEnigmas.filter(enigme => enigme.id !== idEnigma);

        enigmasToUnlock.forEach(nextId => {
            this.activateEnigmaWithAnimation(nextId);
        });

        this.cleanMemory(this.dictionnaryOfEnigmas[idEnigma]);

        this.checkFinalVictory();

        this.isTransitioning = false;
    }

    /**
     * We check here if the 2 enigmas at the end of each way are resolved, if so we show the final victory screen
     */
    checkFinalVictory() {
        const arucoFini = uiManagerInstance.tabManager.tabs[ENIGMA_IDS.ARUCO].statut === 'resolu';
        // const chemin2Fini = uiManagerInstance.onglets['enigmeChemin2'].statut === 'resolu';

        if (arucoFini /* && chemin2Fini */) {
            uiManagerInstance.animations.launchUnlockingEnigmaAnimation('victoire');
            showVictoryScreen();
            this.isRunning = false;
        }
    }

    cleanMemory(enigmaToComplete) {
        if (enigmaToComplete && typeof enigmaToComplete.cleanOfMemory === 'function') {
            enigmaToComplete.cleanOfMemory();
        } else {
            console.log("DEBUG : le nettoyage de l'énigme n'a pas marché (soit l'énigme n'existe plus soit cleanOfMemory n'est pas une fonction");
        }
    }


}

const gameEngineInstance = new GameEngine();
export default gameEngineInstance;