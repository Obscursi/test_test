// colorTracking.js
const video = document.getElementById("webcam");
const cvCanvas = document.getElementById("cv_canvas");

let lastVideoTimeColor = -1;
let cap, srcFrame, blurredFrame, ycrcbFrame, mask, kernel;

const colors_YCrCb = {
    "vert": { lower: [0, 70, 90, 0], upper: [255, 110, 130, 255], bgr: [0, 255, 0, 255] },
    "bleu": { lower: [0, 60, 160, 0], upper: [255, 100, 200, 255], bgr: [255, 0, 0, 255] },
    "rouge": { lower: [0, 190, 80, 0], upper: [255, 230, 120, 255], bgr: [0, 0, 255, 255] }
};

function initOpenCVStructures() {
    if (!cap && window.cvReady && video.videoWidth > 0) {
        cap = new cv.VideoCapture(video);
        srcFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        blurredFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        ycrcbFrame = new cv.Mat(video.height, video.width, cv.CV_8UC3);
        mask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    }
}

function renderLoopColor() {
    if (window.webcamRunning && video.currentTime !== lastVideoTimeColor && video.videoWidth > 0) {
        lastVideoTimeColor = video.currentTime;

        if (window.activeTab === 'opencv' && window.cvReady) {
            initOpenCVStructures();

            cap.read(srcFrame);
            cv.GaussianBlur(srcFrame, blurredFrame, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
            cv.cvtColor(blurredFrame, ycrcbFrame, cv.COLOR_BGR2YCrCb);

            for (let color in colors_YCrCb) {
                let cfg = colors_YCrCb[color];
                let lower = new cv.Mat(ycrcbFrame.rows, ycrcbFrame.cols, ycrcbFrame.type(), cfg.lower);
                let upper = new cv.Mat(ycrcbFrame.rows, ycrcbFrame.cols, ycrcbFrame.type(), cfg.upper);

                cv.inRange(ycrcbFrame, lower, upper, mask);
                cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);
                cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);

                let contours = new cv.MatVector();
                let hierarchy = new cv.Mat();
                cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let clr = new cv.Scalar(cfg.bgr[0], cfg.bgr[1], cfg.bgr[2], cfg.bgr[3]);

                if (contours.size() > 40) {
                    lower.delete(); upper.delete();
                    contours.delete(); hierarchy.delete();
                    continue;
                }

                for (let i = 0; i < contours.size(); ++i) {
                    let c = contours.get(i);
                    if (cv.contourArea(c) > 500) {
                        let approx = new cv.Mat();
                        cv.approxPolyDP(c, approx, 0.02 * cv.arcLength(c, true), true);
                        let vec = new cv.MatVector();
                        vec.push_back(approx);
                        cv.drawContours(srcFrame, vec, -1, clr, 3);
                        approx.delete(); vec.delete();
                    }
                    c.delete();
                }
                lower.delete(); upper.delete();
                contours.delete(); hierarchy.delete();
            }
            cv.imshow("cv_canvas", srcFrame);
        }
    }
    requestAnimationFrame(renderLoopColor);
}

requestAnimationFrame(renderLoopColor);