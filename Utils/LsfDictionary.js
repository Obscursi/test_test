import { getDistance, isFingerFolded } from './HandMaths.js';

export function whichLetterIsDetected(landmarks) {

    // shortcuts for fingers
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // shortcuts for state of the fingers
    const isThumbFolded = isFingerFolded(landmarks, 4, 2);
    const isIndexFolded = isFingerFolded(landmarks, 8, 6);
    const isMiddleFolded = isFingerFolded(landmarks, 12, 10);
    const isRingFolded = isFingerFolded(landmarks, 16, 14);
    const isPinkyFolded = isFingerFolded(landmarks, 20, 18);

    //  If D or P are not getting detected try making 0.1 into 0.15 (if they are triggered too easily, make it lower like 0.08)

    // =======================================================================
    //  DICTIONNAIRE LSF (P, I, E, D, H, U, L, B, A)
    //  Tolérance de distance : Ajuster les valeurs 0.08 / 0.1 selon la caméra
    // =======================================================================

    // 1. Lettre "B" : Les 4 doigts tendus, pouce replié sur la paume
    if (!isIndexFolded && !isMiddleFolded && !isRingFolded && !isPinkyFolded && getDistance(indexTip, middleTip) < 0.08 && getDistance(ringTip, middleTip) < 0.08 && getDistance(thumbTip, landmarks[13]) < 0.08) {
        return "B";
    }

    // 2. Lettre "D" : Index tendu, les autres pliés ET le bout du majeur touche le pouce
    else if (!isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(thumbTip, middleTip) < 0.1) {
        return "D";
    }

    else if (isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded && !isThumbFolded && getDistance(thumbTip, landmarks[5]) > 0.15) {
        return "A";
    }

    // 3. Lettre "E" : Forme de griffe fermée. Tous les doigts pliés.
    // On vérifie que le bout de l'index n'est pas écrasé sur la paume (landmark 0)
    else if (isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(indexTip, landmarks[0]) > 0.1) {
        return "E";
    }

    // 4. Lettre "P" : Index tendu, majeur tendu mais pointant vers le bas.
    // On utilise la coordonnée 'y' pour s'assurer que le majeur est plus bas que l'index (sur MediaPipe, Y augmente vers le bas de l'écran).
    else if (!isIndexFolded && !isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(indexTip, middleTip) > 0.08) {
        return "P";
    }

    // 5. Lettre "H" : Index et majeur tendus et ÉCARTÉS (distance > 0.06), les autres pliés
    else if (!isIndexFolded && isMiddleFolded && isRingFolded && !isPinkyFolded && getDistance(indexTip, middleTip) > 0.06) {
        return "H";
    }

    // 6. Lettre "U" : Index et majeur tendus et COLLÉS (distance < 0.06)
    else if (!isIndexFolded && !isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(indexTip, middleTip) < 0.1) {
        return "U";
    }

    // 7. Lettre "I" : Petit doigt tendu, les 3 autres pliés
    else if (!isPinkyFolded && isIndexFolded && isMiddleFolded && isRingFolded) {
        return "I";
    }

    // 8. Lettre "L" : Index tendu, pouce écarté (loin de la base du petit doigt: 17), autres pliés
    else if (!isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(thumbTip, landmarks[17]) > 0.15) {
        return "L";
    }

    // Si aucun geste ne correspond
    return "";
}