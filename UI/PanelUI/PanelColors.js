import { MAZE_SYMBOLS } from '../../GameLogic/MiniGames/Maze.js';

// La taille d'une case vit dans le CSS (--maze-cell, styles/panels/colors.css) : c'est ce qui permet
// aux media queries de rétrécir le labyrinthe sur les petites fenêtres sans toucher au JS.

// Only used to draw the dot of each chip, so the players can link a chip to a real circle on the table
const COLOR_SWATCHES = {
    "Rouge": "#e00000",
    "Jaune": "#f2d200",
    "Vert": "#00a63f",
    "Cyan": "#00c8dc",
    "Bleu": "#0057d8",
    "Noir": "#000000"
};

export class PanelColors {

    constructor() {

        this.gridElement = document.getElementById("maze-grid");
        this.ringElement = document.getElementById("countdown-ring");
        this.countdownValue = document.getElementById("countdown-value");
        this.chipsElement = document.getElementById("colors-chips");
        this.feedbackElement = document.getElementById("maze-feedback");

        this.playerElement = null;
        this.chips = {};

        this.prepareCountdownRing();
    }

    /**
     * The ring is drawn with a dash as long as the whole circle : moving the dash offset empties it.
     */
    prepareCountdownRing() {
        if (!this.ringElement) return;

        const radius = this.ringElement.r.baseVal.value;
        this.ringLength = 2 * Math.PI * radius;

        this.ringElement.style.strokeDasharray = this.ringLength;
        this.ringElement.style.strokeDashoffset = 0;
    }

    /**
     * Draws the walls once, then adds the character on top of the grid.
     */
    buildMaze(maze) {
        if (!this.gridElement) {
            console.log("DEBUG PanelColors : la grille du labyrinthe est introuvable");
            return;
        }

        this.gridElement.innerHTML = "";
        this.gridElement.style.gridTemplateColumns = `repeat(${maze.cols}, var(--maze-cell))`;

        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                const cell = document.createElement("div");
                cell.className = "maze-cell " + this.classOfCell(maze.grid[row][col]);
                this.gridElement.appendChild(cell);
            }
        }

        // Un élément par personnage : le modèle décide combien il y en a, l'affichage suit.
        this.characterElements = {};

        for (const character of maze.characters) {
            const element = document.createElement("div");
            element.className = `maze-character ${character.name}`;

            this.gridElement.appendChild(element);
            this.characterElements[character.name] = element;
        }

        this.renderMaze(maze);
    }

    classOfCell(symbol) {
        if (symbol === MAZE_SYMBOLS.WALL) return "wall";
        if (symbol === MAZE_SYMBOLS.EXIT) return "exit";
        if (symbol === MAZE_SYMBOLS.START) return "start";
        if (symbol === MAZE_SYMBOLS.START_YELLOW) return "start";
        if (symbol === MAZE_SYMBOLS.SWITCH) return "switch";
        if (symbol === MAZE_SYMBOLS.GATE) return "gate";
        if (symbol === MAZE_SYMBOLS.TREASURE) return "treasure";
        if (symbol === MAZE_SYMBOLS.FLOOR) return "floor";

        console.error("DEBUG : le symbole de la class Cell n'ait pas reconnu");
        return;
    }

    /**
     * Replace chaque personnage, met en avant celui qui répond aux commandes, et ouvre la grille
     * une fois l'interrupteur activé. Appelée après chaque action.
     */
    renderMaze(maze) {
        for (const character of maze.characters) {
            const element = this.characterElements?.[character.name];
            if (!element) continue;

            const { row, col } = character.position;
            // en multiples de --maze-cell : les personnages suivent automatiquement la taille des cases
            element.style.transform =
                `translate(calc(var(--maze-cell) * ${col}), calc(var(--maze-cell) * ${row}))`;

            //l'anneau autour du personnage actif est le seul indice de qui obéit aux couleurs
            element.classList.toggle("active", character === maze.activeCharacter);
        }

        this.gridElement.classList.toggle("gate-open", maze.switchActivated);
    }

    /**
     * One chip per color used by the enigma. It does NOT tell what the color does, only whether the camera sees it.
     */
    buildChips(colorsUsed) {
        if (!this.chipsElement) return;

        this.chipsElement.innerHTML = "";
        this.chips = {};

        for (const color of colorsUsed) {
            const chip = document.createElement("div");
            chip.className = "color-chip";

            const dot = document.createElement("span");
            dot.className = "color-chip-dot";
            dot.style.backgroundColor = COLOR_SWATCHES[color] ?? "#9e9e9e";

            const label = document.createElement("span");
            label.textContent = color;

            chip.append(dot, label);
            this.chipsElement.appendChild(chip);
            this.chips[color] = chip;
        }
    }

    /**
     * A chip goes dim as soon as the camera stops seeing its circle : that is the only live feedback
     * the players get about what the machine understands.
     */
    updateColorsDetected(colorsSeen) {
        const seen = (colorsSeen instanceof Set) ? colorsSeen : new Set();

        for (const [color, chip] of Object.entries(this.chips)) {
            chip.classList.toggle("masked", !seen.has(color));
        }
    }

    updateCountdown(remainingRatio, secondsLeft) {
        if (this.ringElement) {
            this.ringElement.style.strokeDashoffset = this.ringLength * (1 - remainingRatio);
        }
        if (this.countdownValue) {
            this.countdownValue.textContent = secondsLeft;
        }
    }

    showMoved() {
        this.showFeedback("Action enregistrée.", "moved");
    }

    showBlocked() {
        this.showFeedback("Un mur bloque le passage.", "blocked");
    }

    /**
     * On nomme les couleurs cachées plutôt que d'en donner le nombre : si une action ne part pas,
     * ce message dit immédiatement quel cercle la caméra ne voit pas, sans avoir à chercher.
     */
    showNoAction(hiddenColors) {
        const detail = hiddenColors.length === 0
            ? "aucun cercle caché"
            : `cachés : ${hiddenColors.join(", ")}`;

        this.showFeedback(`Aucune action effectuée`);
    }

    showNoEffect(color) {
        this.showFeedback(`${color} : couleur non utilisée pour l'instant.`, "none");
    }

    showCharacterChanged(characterName) {
        const label = (characterName === "yellow") ? "jaune" : "bleu";
        this.showFeedback(`Vous contrôlez maintenant le personnage ${label}.`);
    }

    showSwitchActivated() {
        this.showFeedback("Interrupteur activé : la grille s'ouvre !", "victory");
    }

    showLevelComplete(nextLevelNumber) {
        this.showFeedback(`Niveau réussi ! Passage au labyrinthe ${nextLevelNumber}.`, "victory");
    }

    showVictory() {
        this.showFeedback("Sortie atteinte !", "victory");
    }

    showFeedback(text, classe) {
        if (!this.feedbackElement) return;

        this.feedbackElement.textContent = text;
        this.feedbackElement.className = `maze-feedback ${classe}`;
    }
}
