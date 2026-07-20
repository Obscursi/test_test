import { PanelElementsLsf } from "./PanelLsf.js";

export class PanelManager {
    constructor() {
        this.panelLsf = new this.PanelLsf();
        this.panelWelcome = new this.panelWelcome();
    }
}