export class KeyboardController {
    constructor() {
        this.cheatCode = "grenouilleviolette";
        this.keyBuffer = "";

        this.initKeyboardListener();
    }

    initKeyboardListener() {
        window.addEventListener('keydown', (e) => {
            // On ignore les touches spéciales (Maj, Ctrl, Alt, etc.)
            if (e.key.length !== 1) return;

            this.keyBuffer += e.key.toLowerCase();

            // On maintient la taille du buffer à celle du code
            if (this.keyBuffer.length > this.cheatCode.length) {
                this.keyBuffer = this.keyBuffer.slice(-this.cheatCode.length);
            }

            this.checkPatterns();
        });
    }

    checkPatterns() {
        if (this.keyBuffer === this.cheatCode) {
            console.log("🐸 Code de triche activé !");
            document.dispatchEvent(new CustomEvent('cheatcode_force_resolve'));
            this.keyBuffer = ""; // Reset après succès
        }
    }
}