/**
 * Injecte OpenCV dans la page avec un bouclier anti-conflit pour la mémoire
 */
export async function initOpenCV() {
    return new Promise((resolve, reject) => {
        console.log("⏳ Début du téléchargement sécurisé d'OpenCV...");

        if (window.cv && window.cv.Mat) {
            resolve();
            return;
        }

        // ==============================================================
        // LE BOUCLIER : On cache temporairement la mémoire de MediaPipe
        // pour éviter qu'OpenCV ne l'écrase ou s'emmêle les pinceaux.
        // ==============================================================
        const memoireMediaPipe = window.Module;
        window.Module = undefined;

        // On crée l'import dynamiquement
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
        script.type = 'text/javascript';

        script.onload = () => {
            const checkInterval = setInterval(() => {
                // OpenCV est prêt quand l'objet cv et ses fonctions (Mat) existent
                if (window.cv && window.cv.Mat) {
                    clearInterval(checkInterval);

                    // On restaure la mémoire de MediaPipe maintenant qu'OpenCV est installé
                    if (memoireMediaPipe !== undefined) {
                        window.Module = memoireMediaPipe;
                    }

                    console.log("👁️ OpenCV est totalement initialisé !");
                    resolve();
                }
            }, 100);
        };

        script.onerror = () => {
            reject(new Error("Impossible de charger le script OpenCV.js"));
        };

        document.body.appendChild(script);
    });
}
