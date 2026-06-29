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

    // --- PISTE 1 : Le Glissando de Harpe (Arpège ascendant fluide) ---
    // Un accord magique très large (Do Majeur 9 : Do, Mi, Sol, Si, Ré, Mi, Sol, Do)
    const notesHarpe = [
        261.63, // C4
        329.63, // E4
        392.00, // G4
        493.88, // B4
        587.33, // D5
        659.25, // E5
        783.99, // G5
        1046.50 // C6
    ];

    const dureeGlissando = 2.0; // Le balayage des cordes dure 2 secondes
    const intervalle = dureeGlissando / notesHarpe.length;

    notesHarpe.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // L'onde 'sine' est parfaite pour imiter le son pur et rond d'une corde pincée
        osc.type = 'sine';
        osc.frequency.value = freq;

        const time = t0 + (index * intervalle);

        // L'enveloppe Harpe : Attaque instantanée (le doigt lâche la corde) et résonance très longue
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.25, time + 0.02); // Impact rapide
        gain.gain.exponentialRampToValueAtTime(0.001, time + 3.0); // La corde vibre et s'éteint lentement

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 3.0);
    });

    // --- PISTE 2 : La Poussière d'étoiles pendant le tourbillon ---
    for (let i = 0; i < 15; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';

        // Fréquences très aiguës et cristallines
        osc.frequency.value = 1500 + Math.random() * 1500;

        // Jouées au hasard pendant le vol de l'animation (avant l'impact à 2.5s)
        const time = t0 + Math.random() * 2.4;

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.04, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.8);
    }

    // --- PISTE 3 : L'Accord final d'illumination ---
    // Se déclenche pile à 2.5s, quand le texte s'arrête de tourner au milieu de l'écran
    const impactTime = t0 + 2.5;
    const notesAccordFinal = [523.25, 659.25, 783.99]; // Un accord parfait (Do, Mi, Sol)

    notesAccordFinal.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Un mix subtil : le triangle donne un tout petit peu plus de corps à l'accord final
        osc.type = 'triangle';
        osc.frequency.value = freq;

        // Une belle nappe qui apparaît en douceur et s'évanouit avec le texte
        gain.gain.setValueAtTime(0, impactTime);
        gain.gain.linearRampToValueAtTime(0.15, impactTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, impactTime + 4.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(impactTime);
        osc.stop(impactTime + 4.0);
    });
}