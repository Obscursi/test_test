export function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function isFingerFolded(landmarks, tipIndex, pipIndex) {
    const wrist = landmarks[0];
    return getDistance(landmarks[tipIndex], wrist) < getDistance(landmarks[pipIndex], wrist);
}