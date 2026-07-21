import gameEngineInstance from '../Core/GameEngine.js'

import uiManagerInstance from '../UI/UIManager.js';

export class Enigma {
    /**
     * @param {string} id - L'ID de l'énigme
     * @param {string} name - Le nom d'affichage
     * @param {boolean} isResolved - SI l'énigme a été résolue ou pas
     * @param {Array<string>} enigmesSuivantes - Liste des IDs à débloquer en cas de réussite
     */
    constructor(id, name, enigmesSuivantes = []) {
        this.id = id;
        this.name = name;
        this.isResolved = false;
        this.enigmesSuivantes = enigmesSuivantes;

        this.addEventListenerForceResolution();
    }

    // Ce que l'énigme doit faire quand on l'active (ex: allumer un onglet)
    start() {
        console.log(`Début de l'énigme : ${this.name}`);
    }

    update() {
        console.log("DEBUG : l'over de update n'a pas été fait");
    }


    checkCondition(donneesCapteurs) {
        console.log("DEBUG : l'overwrite de checkCondition n'a pas été fait");
        return false;
    }

    // Action visuelle personnalisée après victoire (à définir pour chaque énigme)
    onSuccess() {//
        console.log(`L'énigme avec le nom : "${this.name}" et l'id : "${this.id}" a été résolue. `);
        this.isResolved = true;
        gameEngineInstance.completeEnigma(this.id, this.enigmesSuivantes);
        uiManagerInstance.tabManager.showTab(this.id); //this reloads the page, showing now the panel of victory instead of the normal panel


        // send to admin : 
        // networkManager.sendMessage({ type: 'VICTOIRE', enigme: this.id });
    }

    /**
     * Mainly used to empty OpenCV, envet listeners and set intervals. Not all enigmas overwrite it.
     */
    cleanOfMemory() {
        console.log(`L'énigme avec l'id ${this.id} n'a pas de méthode clenOfMemory, cas normal`);
    }

    addEventListenerForceResolution() {
        // --- ÉCOUTE DU CODE DE TRICHE ---
        document.addEventListener('cheatcode_force_resolve', () => {

            // Sécurité 1 : Si l'énigme est déjà résolue, on l'ignore
            if (this.isResolved) return;

            //we hade the prefix panel to the id to have the id of the panel
            const panelId = `panel-${this.id}`;
            const myPanel = document.getElementById(panelId);

            if (!myPanel) {
                console.warn(`[Triche] Le panneau '${panelId}' est introuvable dans le DOM.`);
                return;
            }

            // Sécurité 2 : Infaillible pour vérifier si l'élément est vraiment affiché à l'écran
            const isVisible = window.getComputedStyle(myPanel).display !== "none";

            if (isVisible) {
                this.forceResolve();
            } else {
                console.log(`[Triche] Énigme '${this.name}' ignorée car son onglet est caché.`);
            }
        });
    }

    /**
     * Méthode appelée par le cheat code pour forcer la victoire
     */
    forceResolve() {
        console.log(`⚡ Résolution forcée par l'admin pour : ${this.name}`);

        // Si ton énigme enfant a besoin d'être nettoyée (comme couper la webcam)
        /*if (typeof this.cleanOfMemory === 'function') {
            this.cleanOfMemory();
        }*/

        // On déclenche la vraie méthode de succès
        this.onSuccess();
    }
}
