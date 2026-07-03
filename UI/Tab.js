export class Tab {
    /**
     * @param {string} idCible - Le data-target (ex: 'lsf', 'opencv')
     * @param {string} nom - Le nom affiché (ex: "Scanner de Formes")
     * @param {HTMLElement} boutonDOM - L'élément HTML du bouton dans la navigation
     * @param {HTMLElement} panneauDOM - L'élément HTML du contenu de l'énigme
     */
    constructor(idCible, nom, boutonDOM, panneauDOM) {
        this.id = idCible;
        this.name = nom;

        // Les liens vers le HTML réel
        this.button = boutonDOM;
        this.panel = panneauDOM;

        // Le statut actuel de l'onglet dans le jeu
        // États possibles : 'verrouille', 'disponible', 'actif', 'resolu'
        this.statut = 'verrouille';

        // Un callback optionnel (fonction) à déclencher quand on clique sur cet onglet
        // Pratique pour dire "Si on clique sur OpenCV, allume la caméra"
        this.onActivateAction = null;
    }

    /**
     * Étape 1 : Le joueur débloque l'énigme (L'onglet apparaît en orange)
     */
    debloquer() {
        if (this.statut !== 'verrouille') return;

        this.statut = 'disponible';
        this.button.style.display = "block"; // On le rend visible dans la barre
        this.button.classList.remove("completed", "active");

        // Ajout d'une petite animation d'arrivée
        this.button.classList.add("system-boot");
    }

    /**
     * Étape 2 : Le joueur clique sur l'onglet pour le lire (L'onglet devient bleu)
     */
    activer() {
        if (this.statut === 'verrouille') return; // Sécurité

        // Si l'onglet était "disponible", il passe "actif". S'il était "resolu", il le reste.
        const statutPrecedent = this.statut;
        if (this.statut !== 'resolu') {
            this.statut = 'actif';
        }

        // Gestion visuelle du bouton
        this.button.classList.add("active");

        // Gestion visuelle du panneau
        this.panel.classList.add("active");

        // Si une action spéciale a été configurée pour cet onglet, on la lance
        if (this.onActivateAction && statutPrecedent !== 'actif') {
            this.onActivateAction();
        }
    }

    /**
     * Désélectionne l'onglet quand le joueur clique ailleurs
     */
    desactiver() {
        if (this.statut === 'verrouille') return;

        // S'il n'est pas terminé, il redevient juste "disponible" (orange)
        if (this.statut !== 'resolu') {
            this.statut = 'disponible';
        }
        this.button.classList.remove("active");
        this.panel.classList.remove("active");
    }

    /**
     * Étape 3 : Le joueur a réussi l'énigme (L'onglet devient vert)
     */
    makeTabCompleted() {
        this.statut = 'resolu';
        this.button.classList.add("completed");
    }

    /**
     * Permet d'attacher une fonction spécifique à l'ouverture de cet onglet
     */
    definirActionOuverture(fonctionCallback) {
        this.onActivateAction = fonctionCallback;
    }
}