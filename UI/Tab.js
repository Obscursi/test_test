export class Tab {
    /**
     * @param {string} idCible - Le data-target (ex: 'lsf', 'opencv')
     * @param {string} nom - Le nom affiché (ex: "Scanner de Formes")
     * @param {HTMLElement} boutonDOM - L'élément HTML du bouton dans la navigation
     * @param {HTMLElement} panneauDOM - L'élément HTML du contenu de l'énigme
     */
    constructor(idCible, nom, boutonDOM, panneauDOM) {
        this.id = idCible; //this id is the same for the Enigma and the Tab displaying the enigma
        this.name = nom;

        // Les liens vers le HTML réel
        this.button = boutonDOM;
        this.panel = panneauDOM;

        // Actual status of this tab in the game.
        //locked = the player cannot see the tab
        //available = the player can see it and it is in orange
        //resolved = the player can see it and it is in green
        //active = the actual tab the player is looking, in blue (can be resolved or available before and after being active)
        // States possible : 'locked', 'available', 'active', 'resolved'
        this.status = 'locked';

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
        this.button.style.display = "block"; // On le rend visible dans la barre
        this.button.classList.remove("completed", "active");

        // Ajout d'une petite animation d'arrivée
        this.button.classList.add("system-boot");
    }

    /**
     * Étape 2 : Le joueur clique sur l'onglet pour le lire (L'onglet devient bleu)
     */
    activateTab() {
        if (this.status === 'locked') return; // Sécurité

        // Si l'onglet était "available", il passe "active". S'il était "resolved", il le reste.
        const precedentStatus = this.status;
        if (this.status !== 'resolved') {
            this.status = 'active';
        }

        // Gestion visuelle du bouton
        this.button.classList.add("active");

        // Gestion visuelle du panneau
        this.panel.classList.add("active");

        // Si une action spéciale a été configurée pour cet onglet, on la lance
        if (this.onActivateAction && precedentStatus !== 'active') {
            this.onActivateAction();
        }
    }

    /**
     * Désélectionne l'onglet quand le joueur clique ailleurs
     */
    deactivateTab() {
        if (this.status === 'locked') return;

        // S'il n'est pas terminé, il redevient juste "available" (orange)
        if (this.status !== 'resolved') {
            this.status = 'available';
        }
        this.button.classList.remove("active");
        this.panel.classList.remove("active");
    }

    /**
     * Étape 3 : Le joueur a réussi l'énigme (L'onglet devient vert)
     */
    makeTabCompleted() {
        this.status = 'resolved';
        this.button.classList.add("completed");
    }

    /**
     * permits to attach wichever function we like here when the tab opens
     */
    defineOpeningAction(fonctionCallback) {
        this.onActivateAction = fonctionCallback;
    }
}