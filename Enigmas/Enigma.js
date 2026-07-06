import gameEngineInstance from '../Core/GameEngine.js'

export class Enigma {
    constructor(id, name) {
        this.id = id;               //this id is the same in UIManager, it is attached to the tab AND the Enigma 
        this.name = name;             // ex: "Le Mot de Passe"
        this.isResolved = false;     // State of the enigma
    }

    // Ce que l'énigme doit faire quand on l'active (ex: allumer un onglet)
    start() {
        console.log(`Début de l'énigme : ${this.name}`);
        // Logique visuelle (afficher l'onglet, lancer la caméra)
    }

    // La fonction qui vérifie 60 fois par seconde si le joueur fait la bonne action
    // C'est ICI que l'IA enverra ses données (ex: la lettre LSF détectée)
    checkCondition(donneesCapteurs) {
        // Doit être personnalisée pour chaque énigme spécifique
        return false;
    }

    // Action visuelle personnalisée après victoire (à définir pour chaque énigme)
    onSuccess() {//
        console.log(`L'énigme avec le nom : "${this.name}" et l'id : "${this.id}" a été résolue. `);
        this.isResolved = true;
        gameEngineInstance.completeEnigma(this.id);

        // send to admin : 
        // networkManager.sendMessage({ type: 'VICTOIRE', enigme: this.id });
    }
}
