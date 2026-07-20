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
        this.edges = new cv.Mat(); // Nouvelle matrice pour les contours
        this.hsv = new cv.Mat();

        this.contours = new cv.MatVector();
        this.hierarchy = new cv.Mat();

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
      * Analyse une image pour trouver des formes (blobs) et retourne un Set des couleurs détectées.
      * Utilise cv.findContours pour contrer la distorsion de la caméra.
      */
    detecterCerclesColores(srcMat) {
        const colorsDetected = new Set();

        // 1. Préparation : Noir et Blanc + Flou léger
        cv.cvtColor(srcMat, this.gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(this.gray, this.blurred, new cv.Size(5, 5), 0, 0);

        // 2. Extraction des contours avec Canny
        // Les valeurs 50 et 150 contrôlent la sensibilité. C'est robuste à la lumière changeante.
        cv.Canny(this.blurred, this.edges, 50, 150, 3, false);

        // 3. Trouver les contours fermés
        cv.findContours(this.edges, this.contours, this.hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // Préparation de la matrice HSV pour lire la couleur des centres trouvés
        cv.cvtColor(srcMat, this.hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(this.hsv, this.hsv, cv.COLOR_RGB2HSV);

        // 4. Analyse géométrique de chaque contour
        for (let i = 0; i < this.contours.size(); ++i) {
            const cnt = this.contours.get(i);
            const area = cv.contourArea(cnt);

            // Filtre de taille : On ignore les pixels isolés (bruit) et les formes géantes (background)
            // (Tu pourras ajuster ces valeurs selon la taille des cartes à l'écran)
            if (area > 500 && area < 15000) {

                // Calcul du centre de gravité (Moments)
                const M = cv.moments(cnt, false);
                if (M.m00 === 0) continue; // Sécurité mathématique (division par zéro)

                const cx = Math.round(M.m10 / M.m00);
                const cy = Math.round(M.m01 / M.m00);

                // Analyse de "l'arrondi" (Circularité)
                // Formule : (4 * Pi * Aire) / (Périmètre²) -> Vaut 1 pour un cercle parfait
                const perimeter = cv.arcLength(cnt, true);
                const circularity = (4 * Math.PI * area) / (perimeter * perimeter);

                // Avec la distorsion grand angle, un cercle devient ovale, on accepte donc > 0.6
                if (circularity > 0.6) {

                    // On pique le pixel pile au centre du contour
                    const pixel = this.hsv.ucharPtr(cy, cx);
                    const teinte = pixel[0];
                    const saturation = pixel[1];
                    const luminosite = pixel[2];

                    const couleurDetectee = this.analyserCouleurHSV(teinte, saturation, luminosite);

                    if (couleurDetectee !== "Inconnue") {
                        colorsDetected.add(couleurDetectee);

                        // --- Retour Visuel sur le Canvas ---
                        // On dessine le contour de la forme validée (en vert)
                        cv.drawContours(srcMat, this.contours, i, new cv.Scalar(0, 255, 0, 255), 2, cv.LINE_8, this.hierarchy, 0);
                        // On dessine le centre de gravité où la couleur a été lue (en bleu)
                        cv.circle(srcMat, new cv.Point(cx, cy), 4, new cv.Scalar(255, 0, 0, 255), -1);
                    }
                }
            }
        }

        return colorsDetected;
    }

    analyserCouleurHSV(h, s, v) {
        if (s < 40 || v < 40) return "Inconnue";

        if (h >= 5 && h <= 25) {
            if (v < 220) return "Marron";
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
        this.edges.delete();
        this.hsv.delete();
        this.contours.delete();
        this.hierarchy.delete();

        if (this.srcMat) {
            this.srcMat.delete();

        }
    }
}