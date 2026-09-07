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

        this.addEventListenerForAddTimeCheat();
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
     * Ajoute du temps à la mission en cours (code de triche). On recule startTime pour que
     * getRemainingMs() retrouve naturellement le temps ajouté, sans toucher à MISSION_DURATION_MS.
     * @param {number} ms
     */
    addTime(ms) {
        if (this.startTime === null) return; //le timer n'a pas encore démarré

        this.startTime += ms;
        this.tick(); //on rafraîchit l'affichage tout de suite
    }

    /**
     * Code de triche : écoute le raccourci clavier "time" et ajoute 3 minutes.
     */
    addEventListenerForAddTimeCheat() {
        document.addEventListener('cheatcode_add_time', () => {
            console.log("🐸 Triche : +3 minutes ajoutées au chrono.");
            this.addTime(3 * 60 * 1000);
        });
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
