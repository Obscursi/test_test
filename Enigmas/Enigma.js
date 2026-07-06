import gameEngineInstance from '../Core/GameEngine.js'

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
    }

    // Ce que l'énigme doit faire quand on l'active (ex: allumer un onglet)
    start() {
        console.log(`Début de l'énigme : ${this.name}`);
    }


    checkCondition(donneesCapteurs) {
        console.log();
        return false;
    }

    // Action visuelle personnalisée après victoire (à définir pour chaque énigme)
    onSuccess() {//
        console.log(`L'énigme avec le nom : "${this.name}" et l'id : "${this.id}" a été résolue. `);
        this.isResolved = true;
        gameEngineInstance.completeEnigma(this.id, this.enigmesSuivantes);

        // send to admin : 
        // networkManager.sendMessage({ type: 'VICTOIRE', enigme: this.id });
    }
}
