export class ArucoRecognizer {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;

        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");
        }

        this.initConfiguration();
        this.initState();

        this.isInitialized = false;

        this.cap = null;
        this.srcMat = null;
        this.gray = null;
        this.realPoints = null;
        this.clahe = null;
        this.detector = null;
    }

    initConfiguration() {
        const UpLeft1 = 90, UpRight1 = 91, DownRight1 = 93, DownLeft1 = 92;
        const UpLeft2 = 94, UpRight2 = 95, DownRight2 = 97, DownLeft2 = 96;

        this.realWidth = 262;
        this.realHeight = 175;

        // On ne garde que les données physiques
        this.sheets = [
            { ID: 1, corners: [UpLeft1, UpRight1, DownRight1, DownLeft1] },
            { ID: 2, corners: [UpLeft2, UpRight2, DownRight2, DownLeft2] }
        ];
    }

    initState() {

        this.lastAnalysedPicture = null;
    }

    initAruco() {
        this.isInitialized = true;
        return true;
    }

    updateAruco(visionState, webcamRunning) {
        // 1. Sécurité : On ne fait rien si la webcam n'est pas prête
        if (!webcamRunning || !this.video || this.video.videoWidth === 0) return;

        const cv = window.cv;

        // 2. Initialisation paresseuse des matrices si ce n'est pas fait
        if (!this.cap) {
            this.cap = new cv.VideoCapture(this.video);
            this.srcMat = new cv.Mat(this.video.videoHeight, this.video.videoWidth, cv.CV_8UC4);
            this.gray = new cv.Mat();

            this.realPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, this.realWidth, 0, this.realWidth, this.realHeight, 0, this.realHeight]);
            this.clahe = new cv.CLAHE(1.5, new cv.Size(4, 4));

            let dictionary = cv.getPredefinedDictionary(cv.DICT_4X4_100);
            let parameters = new cv.aruco_DetectorParameters();
            let refineParameters = new cv.aruco_RefineParameters(10.0, 3.0, true);
            this.detector = new cv.aruco_ArucoDetector(dictionary, parameters, refineParameters);
        }

        let corners = new cv.MatVector();
        let ids = new cv.Mat();
        let rejected = new cv.MatVector();

        // 3. Vider l'objet d'état injecté pour cette nouvelle frame
        // On modifie l'objet par référence pour que le GameEngine/Enigma reçoive les bonnes infos
        visionState.markers = [];
        visionState.sheetsVisible = [];

        try {
            this.readFrame(this.srcMat);
            this.detector.detectMarkers(this.gray, corners, ids, rejected);

            let cornersPixels = {};

            if (ids.rows > 0) {
                cv.drawDetectedMarkers(this.gray, corners, ids);

                for (let i = 0; i < ids.rows; ++i) {
                    let IDDetected = ids.data32S[i];

                    // Récupération sécurisée contre les fuites de mémoire
                    let markerMat = corners.get(i);
                    let markerCorners = markerMat.data32F;

                    let cx = ((markerCorners[0] + markerCorners[2] + markerCorners[4] + markerCorners[6]) / 4);
                    let cy = ((markerCorners[1] + markerCorners[3] + markerCorners[5] + markerCorners[7]) / 4);

                    cornersPixels[IDDetected] = [cx, cy];

                    // Suppression indispensable de la matrice temporaire
                    markerMat.delete();
                }
            }

            let pPixel = new cv.Mat(1, 1, cv.CV_32FC2);
            let pReal = new cv.Mat();

            for (let s of this.sheets) {
                let [ul, ur, dr, dl] = s.corners;

                if (ul in cornersPixels && ur in cornersPixels && dr in cornersPixels && dl in cornersPixels) {
                    // On enregistre que cette feuille est bien visible
                    visionState.sheetsVisible.push(s.ID);

                    let pointsPixels = cv.matFromArray(4, 1, cv.CV_32FC2, [...cornersPixels[ul], ...cornersPixels[ur], ...cornersPixels[dr], ...cornersPixels[dl]]);
                    let H = cv.findHomography(pointsPixels, this.realPoints);

                    if (!H.empty()) {
                        for (let markerID in cornersPixels) {
                            pPixel.data32F[0] = cornersPixels[markerID][0];
                            pPixel.data32F[1] = cornersPixels[markerID][1];
                            cv.perspectiveTransform(pPixel, pReal, H);

                            // On peuple le tableau de marqueurs pour l'Enigma
                            visionState.markers.push({
                                id: parseInt(markerID),
                                sheetID: s.ID,
                                x: pReal.data32F[0],
                                y: pReal.data32F[1]
                            });
                        }
                    }
                    H.delete();
                    pointsPixels.delete();
                }
            }

            pPixel.delete();
            pReal.delete();
            cv.imshow(this.canvas, this.srcMat);

        } catch (err) {
            console.error("Erreur vision Aruco :", err);
        } finally {
            corners.delete();
            ids.delete();
            rejected.delete();
        }
    }

    readFrame(src) {
        const cv = window.cv;
        this.cap.read(src);

        let rgbaPlanes = new cv.MatVector();
        cv.split(src, rgbaPlanes);
        let firstPlane = rgbaPlanes.get(0);
        firstPlane.copyTo(this.gray);
        firstPlane.delete();
        rgbaPlanes.delete();

        this.clahe.apply(this.gray, this.gray);

        if (this.lastAnalysedPicture) {
            this.lastAnalysedPicture.delete();
        }
        this.lastAnalysedPicture = this.gray.clone();
    }

}