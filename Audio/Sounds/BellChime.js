// La rondeur ne vient pas de la hauteur mais du passe-bas et de la faiblesse des partiels aigus :
// on peut donc monter la fondamentale sans que la cloche devienne criarde.
const FUNDAMENTAL_HZ = 587; // un ré5, une quinte au-dessus du réglage précédent

/**
 * Les partiels d'une cloche ne sont PAS des multiples entiers de la fondamentale, contrairement à
 * une corde ou un tuyau : c'est cette inharmonicité qui fait qu'on entend une cloche et pas un orgue.
 * La tierce mineure (1.2) en est la signature, c'est elle qui donne ce côté légèrement mélancolique.
 *
 * Les aigus s'éteignent bien plus vite que les graves : au moment de la frappe le son est brillant,
 * puis il se dépouille pour ne laisser que le bourdon. Sans cela on obtient un synthé plat.
 */
const PARTIALS = [
    { ratio: 0.5, gain: 0.30, decay: 3.2 }, // bourdon : ce qui reste à la fin
    { ratio: 1.0, gain: 0.40, decay: 2.6 }, // fondamentale
    { ratio: 1.2, gain: 0.26, decay: 1.9 }, // tierce mineure : la signature de la cloche
    { ratio: 1.5, gain: 0.16, decay: 1.3 }, // quinte
    { ratio: 2.0, gain: 0.17, decay: 1.0 }, // octave
    { ratio: 2.5, gain: 0.06, decay: 0.6 }, // adoucis depuis la montée de la fondamentale :
    { ratio: 3.0, gain: 0.04, decay: 0.4 }  // à cette hauteur ils viraient au métallique
];

const TOTAL_DURATION = 2.4;

/**
 * Une cloche que l'on frappe, jouée à chaque énigme réussie.
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} destination - la sortie du AudioManager (volume général)
 */
export function playBellChime(ctx, destination) {
    const t0 = ctx.currentTime;

    const output = ctx.createGain();

    // Passe-bas doux : arrondit l'ensemble et empêche les partiels hauts de rendre le son métallique
    const softener = ctx.createBiquadFilter();
    softener.type = 'lowpass';
    softener.frequency.value = 2600;

    softener.connect(output);
    output.connect(destination);

    for (const partial of PARTIALS) addPartial(ctx, t0, softener, partial);
    addStrike(ctx, t0, softener);

    setTimeout(() => output.disconnect(), (TOTAL_DURATION + 0.2) * 1000);
}

/**
 * Un partiel : attaque quasi instantanée, puis longue décroissance qui lui est propre.
 */
function addPartial(ctx, t0, destination, { ratio, gain, decay }) {
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();

    osc.type = 'sine'; // le plus pur : la richesse vient du nombre de partiels, pas de leur forme
    osc.frequency.value = FUNDAMENTAL_HZ * ratio;

    envelope.gain.setValueAtTime(0.0001, t0);
    envelope.gain.exponentialRampToValueAtTime(gain, t0 + 0.008); // la frappe est immédiate
    envelope.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

    osc.connect(envelope);
    envelope.connect(destination);

    osc.start(t0);
    osc.stop(t0 + Math.min(decay + 0.1, TOTAL_DURATION));
}

/**
 * Le choc du battant sur le métal : très court et discret, mais c'est lui qui fait entendre une
 * cloche FRAPPÉE plutôt qu'une note qui apparaît toute seule.
 */
function addStrike(ctx, t0, destination) {
    const length = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const samples = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1800;
    bandpass.Q.value = 0.8;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.18, t0);
    envelope.gain.exponentialRampToValueAtTime(0.001, t0 + 0.03);

    noise.connect(bandpass);
    bandpass.connect(envelope);
    envelope.connect(destination);

    noise.start(t0);
}
