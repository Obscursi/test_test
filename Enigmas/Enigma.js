export class Enigma {
    constructor(id, nom) {
        this.id = id;               // ex: "enigme_lsf_1"
        this.nom = nom;             // ex: "Le Mot de Passe"
        this.estResolu = false;     // L'état de l'énigme
    }

    // Ce que l'énigme doit faire quand on l'active (ex: allumer un onglet)
    start() {
        console.log(`Début de l'énigme : ${this.nom}`);
        // Logique visuelle (afficher l'onglet, lancer la caméra)
    }

    // La fonction qui vérifie 60 fois par seconde si le joueur fait la bonne action
    // C'est ICI que l'IA enverra ses données (ex: la lettre LSF détectée)
    checkCondition(donneesCapteurs) {
        // Doit être personnalisée pour chaque énigme spécifique
        return false;
    }

    // Ce qui se passe quand on gagne
    unlock() {
        if (!this.estResolu) {
            this.estResolu = true;
            console.log(`🎉 Énigme ${this.nom} résolue !`);

            // 1. Débloquer la suite dans l'interface (nouveaux onglets)
            this.onSuccess();

            // 2. Prévenir l'admin via le réseau
            // networkManager.sendMessage({ type: 'VICTOIRE', enigme: this.id });
        }
    }

    // Action visuelle personnalisée après victoire (à définir pour chaque énigme)
    onSuccess() {
        // Ex: document.getElementById('onglet-secret').style.display = 'block';
    }
}
