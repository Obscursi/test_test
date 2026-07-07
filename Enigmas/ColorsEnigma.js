import { Enigma } from './Enigma.js';
import gameEngineInstance from '../Core/GameEngine.js';

let cv;


export class ColorsEnigma extends Enigma {
    constructor() {
        super('colors', "Scanner de Couleurs");
        // Pré-allocation des matrices pour éviter les fuites de mémoire (très important en OpenCV.js)

        cv = window.cv; //we load the library in the constructor, if we do it before the library will not be loaded (by loadOpenCV in GameEngine.js)
        this.gray = new cv.Mat();
        this.blurred = new cv.Mat();
        this.hsv = new cv.Mat();
        this.circles = new cv.Mat();
    }

    /**
     * Analyse une image (frame de webcam) pour trouver des cercles et leur couleur.
     * @param {cv.Mat} srcMat - L'image source provenant du canvas (format RGBA).
     */
    detecterCerclesColores(srcMat) {
        // 1. Préparation de l'image pour la détection de formes
        cv.cvtColor(srcMat, this.gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(this.gray, this.blurred, new cv.Size(9, 9), 2, 2);

        // 2. Détection des cercles avec la Transformée de Hough
        // Paramètres : image, sortie, méthode, ratio(dp), distance min entre cercles, param1(Canny), param2(Seuil parfait), rayonMin, rayonMax
        cv.HoughCircles(this.blurred, this.circles, cv.HOUGH_GRADIENT, 1, 50, 100, 40, 15, 150);

        // Si aucun cercle n'est trouvé, on arrête
        if (this.circles.cols === 0) return;

        // 3. Conversion de l'image originale en HSV pour l'analyse des couleurs
        cv.cvtColor(srcMat, this.hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(this.hsv, this.hsv, cv.COLOR_RGB2HSV);

        // 4. Boucle sur tous les cercles détectés
        for (let i = 0; i < this.circles.cols; ++i) {
            const x = Math.round(this.circles.data32F[i * 3]);
            const y = Math.round(this.circles.data32F[i * 3 + 1]);
            const rayon = Math.round(this.circles.data32F[i * 3 + 2]);

            // Récupération du pixel central du cercle (en HSV)
            const pixel = this.hsv.ucharPtr(y, x);
            const teinte = pixel[0];     // H (0-179 dans OpenCV)
            const saturation = pixel[1]; // S (0-255)
            const luminosite = pixel[2]; // V (0-255)

            // Détermination de la couleur
            const couleurDetectee = this.analyserCouleurHSV(teinte, saturation, luminosite);

            if (couleurDetectee !== "Inconnue") {
                console.log(`🎯 Cercle détecté : ${couleurDetectee} (Rayon: ${rayon}px)`);

                // Optionnel : Dessiner le contour du cercle sur l'image source en rouge pour le debug visuel
                cv.circle(srcMat, new cv.Point(x, y), rayon, new cv.Scalar(255, 0, 0, 255), 3);
                cv.circle(srcMat, new cv.Point(x, y), 3, new cv.Scalar(0, 255, 0, 255), -1);
            }
        }
    }

    /**
     * Convertit les valeurs mathématiques (H, S, V) en nom de couleur lisible.
     */
    analyserCouleurHSV(h, s, v) {
        // Élimination des pixels trop blancs, noirs ou gris (faible saturation)
        if (s < 40 || v < 40) return "Inconnue";

        // 1. Famille des Oranges / Marrons (Teinte autour de 10-25)
        if (h >= 5 && h <= 25) {
            // Le marron est un orange très sombre (Luminosité < 150)
            if (v < 150) return "Marron";
            else return "Orange";
        }

        // 2. Famille des Verts (Teinte autour de 40-80)
        else if (h > 35 && h <= 80) {
            return "Vert";
        }

        // 3. Famille Bleu-Vert / Cyan (Teinte autour de 80-100)
        else if (h > 80 && h <= 100) {
            return "Bleu-Vert";
        }

        // 4. Famille des Bleus (Teinte autour de 100-130)
        else if (h > 100 && h <= 135) {
            return "Bleu";
        }

        // 5. Famille Rose foncé / Magenta (Teinte autour de 145-175)
        else if (h > 140 && h <= 175) {
            // Pour éviter les roses pastel très clairs, on peut exiger une forte saturation
            if (s > 100) return "Rose foncé";
        }

        return "Inconnue";
    }

    /**
     * À appeler impérativement quand le composant est détruit pour vider la RAM.
     */
    nettoyerMemoire() {
        this.gray.delete();
        this.blurred.delete();
        this.hsv.delete();
        this.circles.delete();
    }
}