import { Enigma } from './Enigma.js';
import { Maze, DIRECTIONS, CHARACTERS } from '../MiniGames/Maze.js';
import { ENIGMA_IDS, IRL_REWARDS } from '../../Utils/Constant.js';

import inputManagerInstance from '../../Inputs/InputManager.js';
import uiManagerInstance from '../../UI/UIManager.js';

// One action is committed every 3 seconds, whatever the players do in between.
const TICK_MS = 3000;

/**
 * The players have to discover by themselves that hiding one circle moves the character in the given direction.
 *
 */
const CONTROLS = {
    [CHARACTERS.BLUE]: {
        "Rouge": DIRECTIONS.UP,
        "Bleu": DIRECTIONS.DOWN,
        "Jaune": DIRECTIONS.LEFT,
        "Vert": DIRECTIONS.RIGHT
    },
    [CHARACTERS.YELLOW]: {
        "Vert": DIRECTIONS.UP,
        "Jaune": DIRECTIONS.DOWN,
        "Bleu": DIRECTIONS.LEFT,
        "Rouge": DIRECTIONS.RIGHT
    }
};

// Cacher ce cercle donne la main à l'autre personnage
const CHANGE_PLAYER_COLOR = "Cyan";

const COLORS_USED = [...Object.keys(CONTROLS[CHARACTERS.BLUE]), CHANGE_PLAYER_COLOR];

/**
 * '#' mur, '.' sol, 'S' départ bleu, 'E' sortie du bleu,
 * 'J' départ jaune, 'I' interrupteur, 'G' grille, 'T' trésor.
 *
 * Level 1 : one character, they are learning the rules of the game
 *
 * Level 2 : the player needs to change character to resolved this labyrinth
 */
const MAZE_LEVELS = [
    [
        "#######",
        "#S#...#",
        "#.#.#.#",
        "#...#.#",
        "#.###.#",
        "#...#E#",
        "#######"
    ],
    [
        "#########",
        "#S..#J..#",
        "#.#.#.#.#",
        "#.#.#...#",
        "#.#.#G###",
        "#I..#..T#",
        "#########"
    ]
];

export class ColorsEnigma extends Enigma {

    constructor() {
        super(ENIGMA_IDS.COLORS, "Scanner de Couleurs", [], IRL_REWARDS.V_AFTER_COLORS);

        this.panel = uiManagerInstance.panelManager.panelColors;
        this.panel.buildChips(COLORS_USED);

        this.loadLevel(0);
    }

    start() {
        super.start();

        this.loadLevel(0);
    }

    loadLevel(index) {
        this.level = index;
        this.maze = new Maze(MAZE_LEVELS[index]);

        this.panel.buildMaze(this.maze);
        this.resetWindow();
    }

    /**
     * Starts a new 3 seconds window : we count, frame by frame, how often each circle is hidden.
     */
    resetWindow(now = Date.now()) {
        this.windowStartTime = now;
        this.framesInWindow = 0;
        this.hiddenFrames = {};

        for (const color of COLORS_USED) this.hiddenFrames[color] = 0;
    }

    update() {
        if (this.isResolved) return;

        inputManagerInstance.update(this.id);
        const playerState = inputManagerInstance.getState();
        this.checkCondition(playerState);
    }

    checkCondition(playerState) {
        const now = Date.now();
        const elapsed = now - this.windowStartTime;

        // the tab was left open in the background : we drop the window instead of committing a very old action
        if (elapsed > 2 * TICK_MS) {
            this.resetWindow(now);
            return;
        }

        this.recordHiddenColors(playerState);

        const remaining = Math.max(0, TICK_MS - elapsed);
        this.panel.updateCountdown(remaining / TICK_MS, Math.ceil(remaining / 1000));
        this.panel.updateColorsDetected(playerState.colors);

        if (elapsed >= TICK_MS) {
            this.commitAction();
            this.resetWindow(now);
        }
    }

    /**
     * A single frame is never trusted : the detection flickers, so every frame of the window votes.
     */
    recordHiddenColors(playerState) {
        const colorsSeen = (playerState.colors instanceof Set) ? playerState.colors : new Set();

        this.framesInWindow++;

        for (const color of COLORS_USED) {
            if (!colorsSeen.has(color)) this.hiddenFrames[color]++;
        }
    }

    /**
     * A circle counts as hidden when it was missing for most of the window. Exactly one hidden circle
     * means one action, anything else is ignored.
     */
    commitAction() {
        if (this.framesInWindow === 0) return;

        //if more than 1/2 of the time the circle is not seen it is considered hidden
        const hiddenColors = COLORS_USED.filter(color => this.hiddenFrames[color] > this.framesInWindow / 2);

        if (hiddenColors.length !== 1) {
            //Message masqué : dire aux joueurs quels cercles la caméra voit leur mâcherait le travail.
            //Le décommenter est en revanche très utile pour régler la détection le jour de l'installation.
            this.panel.showNoAction(hiddenColors);
            return;
        }

        const color = hiddenColors[0];

        if (color === CHANGE_PLAYER_COLOR) {
            this.changeCharacter();
            return;
        }

        this.moveActiveCharacter(color);
    }

    changeCharacter() {
        const character = this.maze.changeCharacter();

        //Un seul personnage dans ce labyrinthe : on ne dit rien. Révéler que le cyan ne sert pas
        //encore éventerait l'existence du second personnage avant le niveau 2.
        if (!character) return;

        this.panel.showCharacterChanged(character.name);
        this.panel.renderMaze(this.maze);
    }

    moveActiveCharacter(color) {
        const direction = CONTROLS[this.maze.activeCharacter.name][color];

        if (!direction) { //cette couleur ne commande rien pour ce personnage
            this.panel.showNoEffect(color);
            return;
        }

        const result = this.maze.tryMove(direction);

        if (!result.moved) {
            this.panel.showBlocked();
            return;
        }

        this.panel.renderMaze(this.maze);

        if (result.finished) {
            this.finishLevel();
        } else if (result.switchJustActivated) {
            this.panel.showSwitchActivated();
        } else {
            this.panel.showMoved();
        }
    }

    finishLevel() {
        const nextLevel = this.level + 1;

        if (nextLevel < MAZE_LEVELS.length) {
            this.loadLevel(nextLevel);
            this.panel.showLevelComplete(nextLevel + 1); //après loadLevel, qui réinitialise le message
            return;
        }

        this.panel.showVictory();
        this.onSuccess();
    }
}
