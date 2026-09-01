export const ENIGMA_STATUS = {
    LOCKED: 'locked',
    AVAILABLE: 'available',
    RESOLVED: 'resolved'
};

export const ENIGMA_IDS = {
    LSF: 'lsf',
    COLORS: 'colors',
    ARUCO: 'aruco',
    GUILTY: 'guilty',
    FINAL: 'final'
};

export const HELP_IDS = {
    CHATBOT: 'chatbot'
};

/**
 * The screens that are not enigmas : the welcome page and the two ends of the game.
 * They are tabs like the others, but no button in the navigation bar leads to them
 * (the welcome one is left by the big start button, the two others open by code).
 */
export const SCREEN_IDS = {
    WELCOME: 'welcome',
    VICTORY: 'victory',
    DEFEAT: 'defeat'
};

/**
 * Physical object the team unlock after completing a certain enigma (on the website (V) or an enigma only present physically (R))
 * So V_... means it the items are unlocked after resolving an enigma on the website, R_... means it is obtain after resolving an enigma IRL. 
 * When they do resolve an enigma IRL, they sometimes do have a code to put in TerminalManager which can unlock differents things, an enigma, a
 * location to physical objects or both.
 */
export const IRL_REWARDS = {
    R_AFTER_DATE: "BUREAU",
    V_AFTER_COLORS: "TABLEAU",
    V_AFTER_ARUCO: "PORTE",
    V_AFTER_LSF: "TOILETTES",
    R_AFTER_MOVIES: "COULOIR"
};

// Combien de temps les bonnes lettres doivent rester détectées pour valider l'énigme LSF.
// Partagé entre l'énigme (la règle) et le panneau (la barre et la durée du crescendo), pour qu'ils ne se désynchronisent pas.
export const LSF_HOLD_MS = 2000;

// The team playing this session. It decides which list of suspects is used by the chatbot and by the guilty enigma.
export const CURRENT_TEAM = "A";

/**
 * The ten suspects of the investigation, one list per team.
 * The order matters : the culprit is always the FIRST name of the list, and the enigmas
 * (chatbot, guilty) rely on the index of each suspect to describe them.
 */
export const SUSPECTS_BY_TEAM = {
    A: ["Elise", "Oliver", "Michael", "Ines", "Theo", "Juliette", "Charlotte", "Antoine", "Maureen", "Ryan"],
    B: ["Heloise", "Louis", "Mike", "Irina", "Timothy", "Julie", "Clea", "Arthur", "Magalie", "Redouane"],
    C: ["Lea", "Lucien", "Lucas", "Adele", "Adam", "Leonie", "Daria", "Pierre", "Leila", "Gabriel"],
    D: ["Alicia", "Noe", "Ugo", "Samia", "Sacha", "Ida", "Maria", "Camille", "Sara", "Nathan"],
    E: ["Jade", "Jules", "Noah", "Alba", "Martin", "Emma", "Esther", "Raphael", "Lina", "Liam"],
    F: ["Agathe", "Mathis", "Tom", "Iris", "Eliott", "Lena", "Lou", "Ethan", "Nour", "Paul"]
};
