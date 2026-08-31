import { renderTimer } from '../UI/TimerUI.js';

const MISSION_DURATION_MS = 1 * 60 * 60 * 1000;

/**
* Began in the gameEngineInstance when the team begins the mission. 
 */
export class Timer {

    /**
     * @param {Function} onTimeOver - appelée une seule fois, quand le compte à rebours atteint zéro
     */
    constructor(onTimeOver = null) {
        this.startTime = null;
        this.interval = null;
        this.onTimeOver = onTimeOver;
    }

    start() {
        if (this.interval) return;

        this.startTime = Date.now();
        this.tick();

        this.interval = setInterval(() => this.tick(), 1000); //every second, we call tick to calculate the new time and render it.
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    /**
     * We calculate the time like that because if we decrement every time, it could derive and not be 100% precise. This way it should be precise.
     */
    getRemainingMs() {
        if (this.startTime === null) return MISSION_DURATION_MS;

        return Math.max(0, MISSION_DURATION_MS - (Date.now() - this.startTime));
    }

    tick() {
        const remaining = this.getRemainingMs();

        const totalSeconds = Math.ceil(remaining / 1000); //ceil pour afficher la durée pleine dès le premier affichage

        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        renderTimer(minutes, seconds);

        if (remaining === 0) {
            this.stop(); //we stop the timer if it has reach 0

            if (this.onTimeOver) {
                const callback = this.onTimeOver;
                this.onTimeOver = null; //on ne prévient qu'une fois, même si tick est rappelée
                callback();
            }
        }
    }
}
