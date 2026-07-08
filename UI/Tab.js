export class Tab {
    /**
     * @param {string} idCible - Le data-target (ex: 'lsf', 'opencv')
     * @param {string} nom - Le nom affiché (ex: "Scanner de Formes")
     * @param {HTMLElement} boutonDOM - L'élément HTML du bouton dans la navigation
     * @param {HTMLElement} panneauDOM - L'élément HTML du contenu de l'énigme
     * @param panneauVictory
     */
    constructor(idCible, nom, boutonDOM, panneauDOM, panneauVictory = document.getElementById("panel-to-implement")) {
        this.id = idCible; //this id is the same for the Enigma and the Tab displaying the enigma
        this.name = nom;

        // Les liens vers le HTML réel
        this.button = boutonDOM;
        this.panel = panneauDOM;

        // Actual status of this tab in the game.
        //locked = the player cannot see the tab
        //available = the player can see it and it is in orange
        //resolved = the player can see it and it is in green
        // States possible : 'locked', 'available', 'resolved'
        this.status = 'locked';

        this.activeOrNot = false;

        this.pannelVictory = panneauVictory;

        // Un callback optionnel (fonction) à déclencher quand on clique sur cet onglet
        // Pratique pour dire "Si on clique sur OpenCV, allume la caméra"
        this.onActivateAction = null;
    }

    /**
     * Étape 1 : Le joueur débloque l'énigme (L'onglet apparaît en orange)
     */
    unlockTab() {
        if (this.status !== 'locked') return;

        this.status = 'available';
        //this.button.style.display = "block";
        this.button.classList.add("available");
        this.button.classList.remove("completed", "active"); //security, when we unlock the button should be orange (available)

        // Ajout d'une petite animation d'arrivée
        this.button.classList.add("system-boot");
    }

    /**
     * Étape 2 : Le joueur clique sur l'onglet pour le lire (L'onglet devient bleu)
     */
    activateTab() {
        if (this.status === 'locked') {
            console.log("DEBUG : activateTab dans Tab a été appelée alors que l'onglet est locked (ne devrait pas être atteignable)");
            return;
        }

        if (this.activeOrNot === true) {
            console.log("DEBUG : activateTab dans Tab a été appelée alors que l'onglet était déjà actif");
            return;
        }

        this.activeOrNot = true;

        // Gestion visuelle du bouton
        this.button.classList.add("active");

        //we show a different panel, depending on if the enigma is resolved or not
        if (this.status === 'resolved') {
            this.pannelVictory.classList.add("active");
        } else {
            this.panel.classList.add("active");
        }
        // Si une action spéciale a été configurée pour cet onglet, on la lance
        if (this.onActivateAction) {
            this.onActivateAction();
        }
    }

    /**
     * change the status back to available or resol
     */
    deactivateTab() {
        if (this.status === 'locked') {
            // as of now, this is normal behavior as  we deactivate all tabs regardless of their status
            return;
        }

        if (this.activeOrNot === false) {
            // as of now, this is normal behavior as  we deactivate all tabs regardless of their status
            return;
        }

        this.activeOrNot = false;

        if (this.status === 'resolved') {
            this.pannelVictory.classList.remove("active");
        } else {
            this.panel.classList.remove("active");
        }

        this.button.classList.remove("active");
    }

    /**
     * Étape 3 : Le joueur a réussi l'énigme (L'onglet devient vert)
     */
    makeTabCompleted() {
        this.status = 'resolved';
        this.button.classList.remove("available");
        this.button.classList.add("completed");
    }

    /**
     * permits to attach wichever function we like here when the tab opens
     */
    defineOpeningAction(fonctionCallback) {
        this.onActivateAction = fonctionCallback;
    }
}