import { PanelLsf } from "./PanelLsf.js";
import { PanelWelcome } from "./PanelWelcome.js";

export class PanelManager {
    constructor() {
        this.panelLsf = new PanelLsf();
        this.panelWelcome = new PanelWelcome();
    }
}