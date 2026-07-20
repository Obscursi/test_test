import { Enigma } from './Enigma.js';
import inputManagerInstance from '../Inputs/InputManager.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';


let cv;

export class ColorsEnigma extends Enigma {
    constructor() {
        super('colors', "Scanner de Couleurs");

        // On charge la bibliothèque depuis la variable globale
        cv = window.cv;

        // Pré-allocation des matrices de traitement
        this.gray = new cv.Mat();
        this.blurred = new cv.Mat();
        this.hsv = new cv.Mat();
        this.circles = new cv.Mat();

        // Variables pour la lecture de la webcam (initialisées plus tard)
        this.cap = null;
        this.srcMat = null;

        // --- Gestion de l'énigme par étapes ---
        this.currentStage = 0;
        this.stageStartTime = null;
        this.lastCountdownSeconds = -1;
        this.detectedColorsThisFrame = new Set();

        // Configuration des conditions pour chaque étape
        this.stageRequirements = [
            {
                name: "Étape 1 : Détecter toutes les couleurs (Marron, Bleu, Bleu-Vert, Orange, Rose foncé)",
                required: ["Marron", "Bleu", "Bleu-Vert", "Orange", "Rose foncé"],
                forbidden: []
            },
            {
                name: "Étape 2 : Cacher le Rose foncé",
                required: ["Marron", "Bleu", "Bleu-Vert", "Orange"],
                forbidden: ["Rose foncé"]
            },
            {
                name: "Étape 3 : Cacher le Rose foncé ET l'Orange",
                required: ["Marron", "Bleu", "Bleu-Vert"],
                forbidden: ["Rose foncé", "Orange"]
            }
        ];
    }

    /**
     * La boucle appelée en continu par le GameEngine quand l'onglet est actif
     */
    update() {
        if (this.isResolved) return;
        inputManagerInstance.update(this.id);
        this.checkCondition();
    }

    /**
     * Vérifie l'image actuelle de la webcam
     */
    checkCondition() {
        const video = document.getElementById("webcam");

        // Sécurité : on attend que la webcam soit vraiment allumée
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

        // Initialisation du capteur OpenCV à la première image valide
        if (!this.cap) {
            this.cap = new cv.VideoCapture(video);
            this.srcMat = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
            this.stageStartTime = Date.now(); // Déclenchement du premier chrono
            console.log("📸 ColorsEnigma : Capteur vidéo OpenCV initialisé.");
            console.log(`🚀 Début de l'énigme ! ${this.stageRequirements[0].name}`);
        }

        try {
            // Lecture de l'image
            this.cap.read(this.srcMat);

            // Analyse et récupération des couleurs détectées sur cette frame
            this.detectedColorsThisFrame = this.detecterCerclesColores(this.srcMat);

            // Affichage sur le canvas
            cv.imshow('mp_canvas', this.srcMat);

            // Gestion du timer de 5 secondes (5000 ms)
            const elapsed = Date.now() - this.stageStartTime;
            const remainingSeconds = Math.ceil((5000 - elapsed) / 1000);

            // Affichage du compte à rebours dans la console
            if (remainingSeconds !== this.lastCountdownSeconds && remainingSeconds >= 0) {
                console.log(`⏱️ Évaluation de l'étape dans : ${remainingSeconds}s...`);
                this.lastCountdownSeconds = remainingSeconds;
            }

            // Fin des 5 secondes -> Évaluation
            if (elapsed >= 5000) {
                this.evaluerEtape();
            }

        } catch (err) {
            console.error("Erreur de traitement OpenCV :", err);
        }
    }

    /**
     * Évalue si les conditions de l'étape actuelle sont respectées
     */
    evaluerEtape() {
        const rules = this.stageRequirements[this.currentStage];
        let stepPassed = true;

        // 1. Vérification des couleurs requises
        for (const reqColor of rules.required) {
            if (!this.detectedColorsThisFrame.has(reqColor)) {
                stepPassed = false;
                break;
            }
        }

        // 2. Vérification des couleurs interdites
        if (stepPassed) {
            for (const forbColor of rules.forbidden) {
                if (this.detectedColorsThisFrame.has(forbColor)) {
                    stepPassed = false;
                    break;
                }
            }
        }

        if (stepPassed) {
            // Réussite de l'étape
            console.log(`✅ Étape validée avec succès !`);
            this.currentStage++;

            if (this.currentStage >= this.stageRequirements.length) {
                // Victoire totale !
                console.log("🏆 VICTOIRE ! Vous avez résolu l'énigme des couleurs !");
                this.isResolved = true;
                this.onSuccess();
            } else {
                // Passage à l'étape suivante
                console.log(`➡️ Passage à l'étape suivante : ${this.stageRequirements[this.currentStage].name}`);
                this.stageStartTime = Date.now();
                this.lastCountdownSeconds = -1;
            }
        } else {
            // Échec -> Retour au début
            console.log(`❌ ÉCHEC ! Les conditions requises n'ont pas été respectées.`);
            console.log(`Couleurs détectées au moment du check :`, Array.from(this.detectedColorsThisFrame));
            console.log(`🔄 Retour au début de l'énigme...`);

            this.currentStage = 0;
            this.stageStartTime = Date.now();
            this.lastCountdownSeconds = -1;
            console.log(`🚀 ${this.stageRequirements[0].name}`);
        }
    }

    /**
     * Analyse une image pour trouver des cercles et retourne un Set des couleurs détectées.
     * @param {cv.Mat} srcMat - L'image source provenant du canvas.
     * @returns {Set<string>} - Set contenant les noms des couleurs identifiées.
     */
    detecterCerclesColores(srcMat) {
        const colorsDetected = new Set();

        cv.cvtColor(srcMat, this.gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(this.gray, this.blurred, new cv.Size(9, 9), 2, 2);

        // Paramètres de détection de cercles
        cv.HoughCircles(this.blurred, this.circles, cv.HOUGH_GRADIENT, 1, 50, 100, 38, 10, 50);

        if (this.circles.cols === 0) return colorsDetected;

        cv.cvtColor(srcMat, this.hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(this.hsv, this.hsv, cv.COLOR_RGB2HSV);

        for (let i = 0; i < this.circles.cols; ++i) {
            const x = Math.round(this.circles.data32F[i * 3]);
            const y = Math.round(this.circles.data32F[i * 3 + 1]);
            const rayon = Math.round(this.circles.data32F[i * 3 + 2]);

            const pixel = this.hsv.ucharPtr(y, x);
            const teinte = pixel[0];
            const saturation = pixel[1];
            const luminosite = pixel[2];

            const couleurDetectee = this.analyserCouleurHSV(teinte, saturation, luminosite);

            if (couleurDetectee !== "Inconnue") {
                colorsDetected.add(couleurDetectee);

                // Dessin visuel sur l'image
                cv.circle(srcMat, new cv.Point(x, y), rayon, new cv.Scalar(255, 0, 0, 255), 3);
                cv.circle(srcMat, new cv.Point(x, y), 3, new cv.Scalar(0, 255, 0, 255), -1);
            }
        }

        return colorsDetected;
    }

    analyserCouleurHSV(h, s, v) {
        if (s < 40 || v < 40) return "Inconnue";

        if (h >= 5 && h <= 25) {
            if (v < 250) return "Marron";
            else return "Orange";
        }
        else if (h > 35 && h <= 80) {
            return "Vert";
        }
        else if (h > 80 && h <= 100) {
            return "Bleu-Vert";
        }
        else if (h > 100 && h <= 135) {
            return "Bleu";
        }
        else if (h > 140 && h <= 175) {
            if (s > 100) return "Rose foncé";
        }
        return "Inconnue";
    }

    cleanOfMemory() {
        this.gray.delete();
        this.blurred.delete();
        this.hsv.delete();
        this.circles.delete();

        if (this.srcMat) {
            this.srcMat.delete();
        }
    }
}