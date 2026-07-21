import { ColorsRecognizer } from '../Recognizers/ColorsRecognizer.js';
import { LsfRecognizer } from '../Recognizers/LsfRecognizer.js';
import { ENIGMA_IDS } from '../../Utils/Constant.js';
import uiManagerInstance from '../../UI/UIManager.js';

import { showError } from '../../UI/AlertManager.js';



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
            this.handleHardwareCrash("Erreur critique lors du chargement des modèles IA.");
            return false;
        }
    }

    toggleWebcam() {
        if (this.webcamRunning) {
            // Extinction volontaire
            this.webcamRunning = false;
            if (this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(track => track.stop());
                this.video.srcObject = null;
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Allumage avec gestion stricte des erreurs matérielles
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    this.video.srcObject = stream;

                    // =========================================================
                    // 1. LE BOUCLIER "HOT UNPLUG" (Débranchement sauvage)
                    // =========================================================
                    const track = stream.getVideoTracks()[0];
                    track.onended = () => {
                        this.handleHardwareCrash("La caméra a été déconnectée");
                    };

                    this.video.addEventListener("loadeddata", () => {
                        // On sécurise aussi le play() qui peut être bloqué par le navigateur
                        this.video.play().catch(e => {
                            this.handleHardwareCrash("Le navigateur bloque la lecture vidéo.");
                        });
                        this.webcamRunning = true;
                    }, { once: true });
                })
                .catch(err => {
                    // =========================================================
                    // 2. L'ANALYSE DES PANNES D'ALLUMAGE
                    // =========================================================
                    this.webcamRunning = false;

                    if (err.name === 'NotAllowedError') {
                        this.handleHardwareCrash("Accès refusé. Vous devez autoriser la caméra dans votre navigateur. Veuillez recharger la page.");
                    } else if (err.name === 'NotFoundError') {
                        this.handleHardwareCrash("Aucune caméra détectée. Branchez un appareil. Veuillez recharger la page.");
                    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                        this.handleHardwareCrash("Caméra indisponible (déjà utilisée par Zoom, une autre page web, etc.). Veuillez recharger la page.");
                    } else {
                        this.handleHardwareCrash(`Erreur matérielle inconnue : ${err.message} Veuillez recharger la page.`);
                    }
                });
        }
    }

    // Cette fonction sera appelée en boucle par le GameEngine
    update(tabId) {

        if (!this.webcamRunning) {
            console.log("DEBUG : update appelé alors que la webcam ne tourne pas");
            return;
        }

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

    /**
     * NOUVEAU : Le centre de crise en cas de crash
     */
    handleHardwareCrash(messageInfo) {
        console.error(`🚨 ALERTE SYSTÈME : ${messageInfo}`);
        this.webcamRunning = false;

        // On coupe le flux cassé proprement pour éviter les fuites de mémoire
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }

        // On prévient le joueur visuellement via l'interface
        if (uiManagerInstance && typeof showError === 'function') {
            showError(messageInfo);
        }
    }
}