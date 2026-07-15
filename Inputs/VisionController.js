import { ColorsRecognizer } from './Recognizers/ColorsRecognizer.js';
import { LsfRecognizer } from './Recognizers/LsfRecognizer.js';
import { ENIGMA_IDS } from '../Utils/Constant.js';



export class VisionController {
    // On passe la vidéo et le canvas en paramètres pour ne pas chercher dans le document HTML
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");

        //this.gestureRecognizer = null;
        //this.lastVideoTime = -1;
        this.webcamRunning = false;

        // L'état propre de la vision à l'instant T
        this.currentResults = [];

        this.lsfRecognizer = new LsfRecognizer(videoElement, canvasElement);
        this.colorsRecognizer = new ColorsRecognizer(videoElement, canvasElement);
    }

    async init() {
        try {
            const initiateLsf = await this.lsfRecognizer.initLsf();
            const initiateColors = await this.colorsRecognizer.initColors();
            return (initiateLsf && initiateColors);
        } catch (error) {
            console.error("Erreur d'initialisation VisionController :", error);
            return false;
        }
    }

    toggleWebcam() {
        if (this.webcamRunning) {
            this.webcamRunning = false;
            if (this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(track => track.stop());
                this.video.srcObject = null;
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                this.video.srcObject = stream;
                this.video.addEventListener("loadeddata", () => {
                    this.video.play();
                    this.webcamRunning = true;
                }, { once: true });
            }).catch(err => {
                console.error("Impossible d'accéder à la webcam.", err);
                this.webcamRunning = false;
            });
        }
    }

    // Cette fonction sera appelée en boucle par le GameEngine
    update(tabId) {

        switch (tabId) {
            case ENIGMA_IDS.LSF:
                this.lsfRecognizer.updateLsf(this.currentResults, this.webcamRunning);
                break;
            case ENIGMA_IDS.COLORS:
                this.colorsRecognizer.updateColors(this.currentResults, this.webcamRunning);
                break;
            default:
                console.log("DEBUG : update dans VisionController n'a pas trouvé la fenêtre");
        }
    }

    // Le InputManager utilisera cette méthode pour récupérer les données
    getResults() {
        return this.currentResults;
    }
}