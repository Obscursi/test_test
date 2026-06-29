// Utils/audioSynth.js

/**
 * Génère une mélodie de victoire synthétique inspirée des ouvertures de coffres de RPG.
 * Utilise l'API Web Audio native sans aucun fichier externe.
 */
export function playTabUnlockingSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const t0 = ctx.currentTime;
    const dureeMontee = 2.5;

    // --- PISTE 1 : La montée de suspense (Sawtooth) ---
    const nbNotesMontee = 25;
    const interval = dureeMontee / nbNotesMontee;

    for (let i = 0; i < nbNotesMontee; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 220 * Math.pow(1.05946, i);

        gain.gain.setValueAtTime(0, t0 + i * interval);
        gain.gain.linearRampToValueAtTime(0.1, t0 + i * interval + 0.02);
        gain.gain.linearRampToValueAtTime(0, t0 + i * interval + interval);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0 + i * interval);
        osc.stop(t0 + i * interval + interval);
    }

    // --- PISTE 2 : Les étoiles scintillantes (Sine) ---
    for (let i = 0; i < 20; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1200 + Math.random() * 1300;

        const time = t0 + Math.random() * dureeMontee;

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.06, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    // --- PISTE 3 : L'accord de triomphe (Sawtooth) ---
    const notesTriomphe = [523.25, 659.25, 783.99, 1046.50];

    notesTriomphe.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, t0 + dureeMontee);
        gain.gain.linearRampToValueAtTime(0.15, t0 + dureeMontee + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dureeMontee + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0 + dureeMontee);
        osc.stop(t0 + dureeMontee + 2.5);
    });
}