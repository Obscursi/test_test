import { Enigma } from './Enigma.js';
import { ENIGMA_IDS, IRL_REWARDS } from '../../Utils/Constant.js';
import inputManagerInstance from '../../Inputs/InputManager.js';
import uiManagerInstance from '../../UI/UIManager.js';

export class ArucoEnigma extends Enigma {
    constructor() {
        super(ENIGMA_IDS.ARUCO, "Aruco vrai/faux", [ENIGMA_IDS.LSF], IRL_REWARDS.V_AFTER_ARUCO);

        // Configuration métier du jeu
        this.positionTolerance = 10;
        this.nbIterations = 100;
        this.maxID = 100;

        this.dictCards = {
            1: { "ID": 0, "falseID": 11, "pos": [7, 124], "sheet": 1, "name": "Deux IA peuvent créer leur propre langage." },
            2: { "ID": 1, "falseID": 10, "pos": [77, 124], "sheet": 1, "name": "L'IA peut améliorer le diagnostic de certaines maladies, en soutien au médecin." },
            3: { "ID": 2, "falseID": 9, "pos": [147, 124], "sheet": 1, "name": "Une IA a une meilleure puissance de calcul qu'un humain." },
            4: { "ID": 3, "falseID": 8, "pos": [217, 124], "sheet": 1, "name": "Les IA génératives sont très mauvaises en mathématiques." },
            5: { "ID": 4, "falseID": 15, "pos": [7, 124], "sheet": 2, "name": "Les IA peuvent mentir." },
            6: { "ID": 5, "falseID": 14, "pos": [77, 124], "sheet": 2, "name": "L'IA peut apprendre de façon autonome." },
            7: { "ID": 6, "falseID": 13, "pos": [147, 124], "sheet": 2, "name": "Les IA récentes consomment moins d'énergie qu'une recherche Internet classique." },
            8: { "ID": 7, "falseID": 12, "pos": [217, 124], "sheet": 2, "name": "L'IA générative peut créer du contenu original." }
        };

        // État de l'énigme
        this.checkNow = false;
        this.nbIterationsCheck = 0;
        this.dictID = {};
        this.sheetsInvisibleCounter = { 1: 0, 2: 0 };

        this.bindUI();
    }

    bindUI() {
        const btnVerifier = document.getElementById("btnVerifier");
        if (btnVerifier) {
            btnVerifier.addEventListener("click", () => {
                this.startCheck();
            });
        }
    }

    startCheck() {
        if (this.isResolved) return;

        // Reset des compteurs de détection
        for (let i = 0; i < this.maxID; i++) {
            this.dictID[i] = 0;
        }
        this.sheetsInvisibleCounter = { 1: 0, 2: 0 };

        this.checkNow = true;
        this.nbIterationsCheck = 0;

        document.getElementById("result").textContent = "Analyse en cours ...";
        document.getElementById("message").textContent = "";
        document.getElementById("message2").textContent = "";
    }

    update() {
        if (this.isResolved) return;

        inputManagerInstance.update(this.id);
        // playerState contient désormais { markers: [...], sheetsVisible: [...] } fourni par le Recognizer
        const playerState = inputManagerInstance.getState();

        this.checkCondition(playerState);
    }

    checkCondition(currentResults) {
        if (!this.checkNow || !currentResults) return;

        // 1. Comptabiliser l'absence des feuilles (pour avertir le joueur)
        [1, 2].forEach(sheetID => {
            if (!currentResults.sheetsVisible.includes(sheetID)) {
                this.sheetsInvisibleCounter[sheetID]++;
            }
        });

        // 2. Analyser les marqueurs détectés sur cette frame
        currentResults.markers.forEach(marker => {
            // On vérifie si ce marqueur correspond à l'une de nos cartes métier
            for (let cardKey of Object.keys(this.dictCards)) {
                let card = this.dictCards[cardKey];

                // Si le marqueur est sur la bonne feuille et proche des bonnes coordonnées
                if (card.sheet === marker.sheetID &&
                    Math.abs(marker.x - card.pos[0]) <= this.positionTolerance &&
                    Math.abs(marker.y - card.pos[1]) <= this.positionTolerance) {

                    this.dictID[marker.id]++;
                }
            }
        });

        // 3. Gestion de la fin de l'analyse
        this.nbIterationsCheck++;
        if (this.nbIterationsCheck >= this.nbIterations) {
            this.checkNow = false;
            this.evaluateGame();
        }
    }

    evaluateGame() {
        let nbCardsOK = 0;
        let nbCardsToPlace = Object.keys(this.dictCards).length;
        let allSheetsVisible = true;

        let text = "";
        let mess = "";
        let mess2 = "";

        // Vérifie si toutes les cartes attendues ont été vues au moins une fois
        for (let carteID in this.dictID) {
            for (let i of Object.keys(this.dictCards)) {
                if (carteID == this.dictCards[i].ID && this.dictID[carteID] >= 1) {
                    nbCardsOK++;
                }
            }
        }

        // Identifier les erreurs pour guider le joueur
        for (let i of Object.keys(this.dictCards)) {
            if (this.dictID[this.dictCards[i].ID] === 0 && this.dictID[this.dictCards[i].falseID] === 0) {
                mess += `La carte "${this.dictCards[i].name}" n'a pas été détectée à son emplacement. `;
                mess2 = "Si une carte n'a pas été détectée, passez brièvement la main devant la caméra pendant la vérification.";
            }
        }

        // Vérifier que les feuilles n'ont pas été cachées trop longtemps
        if (this.sheetsInvisibleCounter[1] > (this.nbIterations - 2) ||
            this.sheetsInvisibleCounter[2] > (this.nbIterations - 2)) {
            allSheetsVisible = false;
        }

        // Affichage des résultats
        if (allSheetsVisible) {
            if (nbCardsOK === nbCardsToPlace) {
                text = "Bravo !";
                this.onSuccess(); // Déclenche la victoire globale du GameEngine
            } else {
                text = `Nombre de cartes correctes et bien placées: ${nbCardsOK} sur ${nbCardsToPlace} cartes`;
            }
        } else {
            text = "Tous les coins du plateau de jeu ne sont pas visibles ! N'hésitez pas à passer la main brièvement devant la caméra pendant la vérification.";
            mess = "";
            mess2 = "";
        }

        document.getElementById("result").textContent = text;
        document.getElementById("message").textContent = mess;
        document.getElementById("message2").textContent = mess2;
    }
}
