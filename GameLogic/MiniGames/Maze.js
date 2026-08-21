export const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

export const ACTIONS = {
    CHANGE_PLAYER: 'change_player',
    NOTHING: 'nothing' //dummy actions if  we ever need one
}

export const MAZE_SYMBOLS = {
    WALL: '#',
    FLOOR: '.',
    START: 'S',
    EXIT: 'E'
};

const MOVES = {
    [DIRECTIONS.UP]: { row: -1, col: 0 },
    [DIRECTIONS.DOWN]: { row: 1, col: 0 },
    [DIRECTIONS.LEFT]: { row: 0, col: -1 },
    [DIRECTIONS.RIGHT]: { row: 0, col: 1 }
};

/**
 * Pure model of the maze mini game : it knows the walls and where the character stands, nothing about the DOM
 * nor about the colors used to control it. That way the same maze can be reused with another set of controls
 * (the second character of the enigma will only need a different color mapping).
 */
export class Maze {

    /**
     * @param {Array<string>} layout - one string per row, using MAZE_SYMBOLS ('#' wall, '.' floor, 'S' start, 'E' exit)
     */
    constructor(layout) {
        this.grid = layout.map(row => row.split(''));
        this.rows = this.grid.length;
        this.cols = this.grid[0].length;

        this.start = this.findCell(MAZE_SYMBOLS.START);
        this.exit = this.findCell(MAZE_SYMBOLS.EXIT);

        this.reset();
    }

    findCell(symbol) {
        for (let row = 0; row < this.rows; row++) {
            const col = this.grid[row].indexOf(symbol);
            if (col !== -1) return { row, col };
        }

        console.log(`DEBUG Maze : le symbole '${symbol}' est absent du labyrinthe`);
        return { row: 1, col: 1 };
    }

    reset() {
        this.position = { ...this.start };
        this.isFinished = false;
    }

    isWall(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return true; //outside of the grid
        return this.grid[row][col] === MAZE_SYMBOLS.WALL;
    }

    /**
     * Tries to move the character one cell in the given direction.
     * @returns {{moved: boolean, finished: boolean}} moved is false when a wall blocks the way
     */
    tryMove(direction) {
        if (this.isFinished) return { moved: false, finished: true };

        const move = MOVES[direction];
        if (!move) {
            console.log(`DEBUG Maze : la direction '${direction}' n'existe pas`);
            return { moved: false, finished: false };
        }

        const row = this.position.row + move.row;
        const col = this.position.col + move.col;

        if (this.isWall(row, col)) return { moved: false, finished: false };

        this.position = { row, col };
        this.isFinished = (row === this.exit.row && col === this.exit.col);

        return { moved: true, finished: this.isFinished };
    }
}
