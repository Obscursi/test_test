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

        this.sheetHomographies = {
            1: null, 
            2: null
        };
        
        this.sheetHomographyAge = {
            1: 999,
            2: 999
        };

        this.maxHomographyAge = 200;

        this.savedSheetCorners = {
            1: {},
            2: {}
        };

        this.sheetCornerAge = {
            1: {},
            2: {}
        };

        this.maxCornerAge = 200;
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

        for (const sheetID of [1, 2]) {
            if (this.sheetHomographyAge[sheetID] < 999) {
                this.sheetHomographyAge[sheetID]++;
            }
        }

        for (const sheet of this.sheets) {
            for (const IDDetected of sheet.corners) {
                if (this.sheetCornerAge[sheet.ID][IDDetected] !== undefined) {
                    this.sheetCornerAge[sheet.ID][IDDetected]++;
                }
            }
        }
        
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

                    for (const sheet of this.sheets) {

                        if (sheet.corners.includes(IDDetected)) {

                            this.savedSheetCorners[sheet.ID][IDDetected] = {
                                x: cx,
                                y: cy
                            };

                            this.sheetCornerAge[sheet.ID][IDDetected] = 0;
                        }
                    }

                    // Suppression indispensable de la matrice temporaire
                    markerMat.delete();
                }
            }

            let sheetCornersPixels = {};
            
            for (const sheet of this.sheets) {

                for (const IDDetected of sheet.corners) {

                    const saved = this.savedSheetCorners[sheet.ID][IDDetected];
                    const age = this.sheetCornerAge[sheet.ID][IDDetected];

                    if (saved && age!== undefined && age <= this.maxCornerAge) {
                        sheetCornersPixels[IDDetected] = [saved.x, saved.y];
                    }
             
                }
            
            }
            
            let pPixel = new cv.Mat(1, 1, cv.CV_32FC2);
            let pReal = new cv.Mat();

            for (let s of this.sheets) {
                let [ul, ur, dr, dl] = s.corners;

                if (ul in sheetCornersPixels && ur in sheetCornersPixels && dr in sheetCornersPixels && dl in sheetCornersPixels) {
                    // On enregistre que cette feuille est bien visible
                    visionState.sheetsVisible.push(s.ID);

                    let pointsPixels = cv.matFromArray(4, 1, cv.CV_32FC2, [...sheetCornersPixels[ul], ...sheetCornersPixels[ur], ...sheetCornersPixels[dr], ...sheetCornersPixels[dl]]);
                    let H = cv.findHomography(pointsPixels, this.realPoints);

                    if (!H.empty()) {
                        if (this.sheetHomographies[s.ID]) {
                            this.sheetHomographies[s.ID].delete();
                        }
                        this.sheetHomographies[s.ID] = H.clone();
                        this.sheetHomographyAge[s.ID] = 0;

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
                } else if (
                    this.sheetHomographies[s.ID] && 
                    (this.sheetHomographyAge[s.ID] <= this.maxHomographyAge)
                ) {

                    let H = this.sheetHomographies[s.ID];

                    visionState.sheetsVisible.push(s.ID);

                    for (const markerID in cornersPixels) {
                        pPixel.data32F[0] = cornersPixels[markerID][0];
                        pPixel.data32F[1] = cornersPixels[markerID][1];
                        cv.perspectiveTransform(pPixel, pReal, H);
                        
                        visionState.markers.push({
                                id: parseInt(markerID),
                                sheetID: s.ID,
                                x: pReal.data32F[0],
                                y: pReal.data32F[1]
                        });
                    }
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

        cv.cvtColor(src, this.gray, cv.COLOR_RGBA2GRAY);
        this.clahe.apply(this.gray, this.gray);

        if (this.lastAnalysedPicture) {
            this.lastAnalysedPicture.delete();
        }
        this.lastAnalysedPicture = this.gray.clone();
    }
}
    
  
