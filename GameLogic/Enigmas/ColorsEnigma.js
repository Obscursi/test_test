import { Enigma } from './Enigma.js';
import { Maze, DIRECTIONS, ACTIONS } from '../MiniGames/Maze.js';
import { ENIGMA_IDS, IRL_REWARDS } from '../../Utils/Constant.js';

import inputManagerInstance from '../../Inputs/InputManager.js';
import uiManagerInstance from '../../UI/UIManager.js';

// One action is committed every 3 seconds, whatever the players do in between.
const TICK_MS = 3000;

/**
 * The players have to discover by themselves that hiding one circle moves the character in the given direction.
 */
const COLOR_TO_DIRECTION = {
    "Rouge": DIRECTIONS.UP,
    "Bleu": DIRECTIONS.DOWN,
    "Jaune": DIRECTIONS.LEFT,
    "Vert": DIRECTIONS.RIGHT
};

const COLOR_TO_CHANGE_PLAYER = {
    "Cyan": ACTIONS.CHANGE_PLAYER,
}

const COLORS_USED = [...Object.keys(COLOR_TO_DIRECTION), ...Object.keys(COLOR_TO_CHANGE_PLAYER)];

/**
 * '#' wall, '.' floor, 'S' start, 'E' exit.
 * The shortest way out is 12 moves (bas, droite, haut, droite, bas) and the corridor going down from
 * the start is a dead end, so a wrong guess costs moves without ever locking the players out.
 */
const MAZE_LAYOUT = [
    "#######",
    "#S#...#",
    "#.#.#.#",
    "#...#.#",
    "#.###.#",
    "#...#E#",
    "#######"
];

export class ColorsEnigma extends Enigma {

    constructor() {
        super(ENIGMA_IDS.COLORS, "Scanner de Couleurs", [], IRL_REWARDS.V_AFTER_COLORS);

        this.maze = new Maze(MAZE_LAYOUT);

        this.panel = uiManagerInstance.panelManager.panelColors;
        this.panel.buildMaze(this.maze);
        this.panel.buildChips(COLORS_USED);

        this.resetWindow();
    }

    start() {
        super.start();

        this.maze.reset();
        this.panel.updatePlayerPosition(this.maze);

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
     * means one move, anything else is ignored.
     */
    commitAction() {
        if (this.framesInWindow === 0) return;

        //if more than 1/2 of the time the circle is not seen it is considered hidden
        const hiddenColors = COLORS_USED.filter(color => this.hiddenFrames[color] > this.framesInWindow / 2);

        if (hiddenColors.length !== 1) {
            this.panel.showNoAction(hiddenColors);
            return;
        }

        const color = hiddenColors[0]
        let result;

        if (COLOR_TO_CHANGE_PLAYER[color] === ACTIONS.CHANGE_PLAYER) { //with the color we either change the player
            ///TODO : change player
            return;
        } else {
            result = this.maze.tryMove(COLOR_TO_DIRECTION[hiddenColors[0]]); //or move in a direction
        }


        if (!result.moved) {
            this.panel.showBlocked();
            return;
        }

        this.panel.updatePlayerPosition(this.maze);

        if (result.finished) {
            this.panel.showVictory();
            this.onSuccess();
        } else {
            this.panel.showMoved();
        }
    }
}
