import { waitControl } from '../shared/Control.js';
import { handleAccount } from '../steps/AccountStep.js';
import { handleLifeline } from '../steps/LifelineStep.js';
import { handleMedicaid } from '../steps/MedicaidStep.js';
import { handleFinalSteps } from '../steps/FinalStep.js';

export class GooglePage {
    constructor(page) { this.page = page; }

    async runProcessCustom(data, startAtStep = 1) {
        let res = null;

        // PASO 1: ACCOUNT
        if (startAtStep <= 1) {
            console.log("🚀 Ejecutando Paso 1: Account");
            res = await handleAccount(this.page, data, waitControl);
        }

        // PASO 2: LIFELINE
        if (startAtStep <= 2) {
            console.log("🚀 Ejecutando Paso 2: Lifeline");
            res = await handleLifeline(this.page, waitControl);
        }

        // PASO 3: MEDICAID
        if (startAtStep <= 3) {
            console.log("🚀 Ejecutando Paso 3: Medicaid");
            res = await handleMedicaid(this.page, waitControl);
        }

        // PASO 4: FINAL (Firma, Éxito, Duplicado)
        if (startAtStep <= 4) {
            console.log("🚀 Ejecutando Paso 4: Final Steps");
            res = await handleFinalSteps(this.page, data, waitControl);
        }

        return res;
    }
}
