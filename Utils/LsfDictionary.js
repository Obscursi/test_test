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


    //  Detectables letters : P, I, E, D
    //  If D or P are not getting detected try making 0.1 into 0.15 (if they are triggered too easily, make it lower like 0.08)

    // =======================================================================
    //  DICTIONNAIRE LSF (10 Lettres)
    //  Tolérance de distance : Ajuster les valeurs 0.08 / 0.1 selon la caméra
    // =======================================================================


    // 2. Lettre "D" : Index tendu, les autres pliés ET le bout du majeur touche le pouce
    if (!isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(thumbTip, middleTip) < 0.1) {
        return "D";
    }

    // 3. Lettre "E" : Forme de griffe fermée. Tous les doigts pliés.
    // On s'assure que ce n'est pas un A en vérifiant que le bout de l'index n'est pas écrasé sur la paume (landmark 0)
    else if (isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(indexTip, landmarks[0]) > 0.1) {
        return "E";
    }

    // 4. Lettre "I" : Petit doigt tendu, les 3 autres pliés
    else if (!isPinkyFolded && isIndexFolded && isMiddleFolded && isRingFolded) {
        return "I";
    }

    // 5. Lettre "L" : Index tendu, pouce écarté (loin de la base du petit doigt: 17), autres pliés
    else if (!isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(thumbTip, landmarks[17]) > 0.15) {
        return "L";
    }

    // 6. Lettre "O" : Tous les bouts des doigts se rejoignent sur le pouce
    else if (getDistance(indexTip, thumbTip) < 0.09 && getDistance(middleTip, thumbTip) < 0.09 && getDistance(ringTip, thumbTip) < 0.09) {
        return "O";
    }

    // 7. Lettre "U" : Index et majeur tendus, MAIS ils sont collés l'un à l'autre
    else if (!isIndexFolded && !isMiddleFolded && isRingFolded && isPinkyFolded && getDistance(indexTip, middleTip) < 0.06) {
        return "U";
    }

    // 8. Lettre "Y" : Pouce tendu, petit doigt tendu, les 3 du milieu pliés (Signe "Shaka" / Téléphone)
    else if (!isPinkyFolded && isIndexFolded && isMiddleFolded && isRingFolded && getDistance(thumbTip, landmarks[17]) > 0.15) {
        return "Y";
    }

    // 9. Ta définition d'origine pour le "P" (Je l'ai laissée à la fin, mais attention au conflit avec U/V s'il n'est pas parfait)
    else if (!isIndexFolded && !isMiddleFolded && isRingFolded && isPinkyFolded) {
        return "P";
    }

    return "";
}