export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Lowercase the text, remove the accents and the punctuation.
 * Used every time we compare what the player types with what we expect (chatbot answers, name of the culprit).
 */
export const normalizeText = (text) => text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:()'"-]/g, "")
    .trim();

/**
 *  levenshtein function used in chatbot. It is a library function that I imported here
 *
 * @returns {number} 0 if both word are similar
 */
export function levenshtein(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    let row = Array.from({ length: b.length + 1 }, (_, j) => j);

    for (let i = 1; i <= a.length; i++) {
        let previousDiagonal = row[0];
        row[0] = i;

        for (let j = 1; j <= b.length; j++) {
            const above = row[j];
            const cost = (a[i - 1] === b[j - 1]) ? 0 : 1;

            row[j] = Math.min(
                above + 1,
                row[j - 1] + 1,
                previousDiagonal + cost
            );

            previousDiagonal = above;
        }
    }

    return row[b.length];
}

/**
 * True if both words contains the same letters
 */
export function isAnagramOf(word, reference) {
    if (word.length !== reference.length) return false;
    const sort = (s) => s.split('').sort().join('');
    return sort(word) === sort(reference);
}
