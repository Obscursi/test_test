import { Enigma } from './Enigma.js';
import inputManagerInstance from '../Inputs/InputManager.js';

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
        // On récupère la balise vidéo native (soit via le DOM, soit via l'InputManager)
        const video = document.getElementById("webcam");

        // Sécurité : on attend que la webcam soit vraiment allumée et affiche une image
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

        // 1. Initialisation du capteur OpenCV à la première image valide
        if (!this.cap) {
            this.cap = new cv.VideoCapture(video);
            // On crée la matrice source aux dimensions exactes de la vidéo
            this.srcMat = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
            console.log("📸 ColorsEnigma : Capteur vidéo OpenCV initialisé.");
        }

        try {
            // 2. Lecture de l'image (copie les pixels de la vidéo vers this.srcMat)
            this.cap.read(this.srcMat);

            // 3. Analyse de l'image
            this.detecterCerclesColores(this.srcMat);

            // 4. (Optionnel) Si tu veux voir ce qu'OpenCV détecte à l'écran, 
            // tu peux renvoyer l'image modifiée sur le canvas par-dessus la vidéo :
            cv.imshow('mp_canvas', this.srcMat);

        } catch (err) {
            // OpenCV.js peut être très capricieux, un try/catch évite de crasher tout le jeu
            console.error("Erreur de traitement OpenCV :", err);
        }
    }

    /**
     * Analyse une image (frame de webcam) pour trouver des cercles et leur couleur.
     * @param {cv.Mat} srcMat - L'image source provenant du canvas (format RGBA).
     */
    detecterCerclesColores(srcMat) {
        new Promise(resolve => setTimeout(resolve, 10000));
        cv.cvtColor(srcMat, this.gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(this.gray, this.blurred, new cv.Size(9, 9), 2, 2);

        // Paramètres de détection de cercles : à ajuster selon la distance de la caméra
        cv.HoughCircles(this.blurred, this.circles, cv.HOUGH_GRADIENT, 1, 50, 100, 40, 30, 60);

        if (this.circles.cols === 0) return;

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
                console.log(`🎯 Cercle détecté : ${couleurDetectee} (Rayon: ${rayon}px)`);

                // Dessin visuel sur l'image (si tu utilises cv.imshow plus haut)
                cv.circle(srcMat, new cv.Point(x, y), rayon, new cv.Scalar(255, 0, 0, 255), 3);
                cv.circle(srcMat, new cv.Point(x, y), 3, new cv.Scalar(0, 255, 0, 255), -1);
            }
        }
    }

    analyserCouleurHSV(h, s, v) {
        if (s < 40 || v < 40) return "Inconnue";

        if (h >= 5 && h <= 25) {
            if (v < 150) return "Marron";
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

        // On n'oublie pas de nettoyer la matrice source si elle a été allouée
        if (this.srcMat) {
            this.srcMat.delete();
        }
    }
}