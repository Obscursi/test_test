export class PanelElementsLsf {

    constructor() {
        this.lsfTextBox = document.getElementById("lsf-sign-box");
    }

    /**
    * Shows what letter we detect
    */
    updateGestureDebugText(gestures) {
        // SÉCURITÉ : On filtre les éléments vides ou non définis
        const gestesValides = gestures.filter(g => g && g !== "");

        if (gestures.length > 0) {
            this.lsfTextBox.style.backgroundColor = "#E91E63";
            this.lsfTextBox.innerText = `Signe(s) : ${gestures.join(" + ")}`;
        } else {
            this.lsfTextBox.style.backgroundColor = "#007f8b";
            this.lsfTextBox.innerText = "Aucun signe clair.";
        }
    }
}