import { waitControl } from '../shared/Control.js';
import { handleAccount } from '../steps/AccountStep.js';
import { handleLifeline } from '../steps/LifelineStep.js';
import { handleMedicaid } from '../steps/MedicaidStep.js';
import { handleFinalSteps } from '../steps/FinalStep.js';

export class GooglePage {
    constructor(page) { this.page = page; }

    // Simula una espera humana aleatoria
    async humanDelay(min = 1500, max = 3500) {
        const ms = Math.floor(Math.random() * (max - min + 1) + min);
        await this.page.waitForTimeout(ms);
    }

    async runProcessCustom(data, startAtStep = 1) {
        let res = null;

        // Espera inicial para que la web cargue sus scripts de seguridad
        await this.humanDelay(2000, 4000);

        // PASO 1: ACCOUNT
        if (startAtStep <= 1) {
            console.log("🚀 Paso 1: Creando cuenta...");
            res = await handleAccount(this.page, data, waitControl);
            await this.humanDelay();
        }

        // PASO 2: LIFELINE
        if (startAtStep <= 2) {
            console.log("🚀 Paso 2: Lifeline...");
            res = await handleLifeline(this.page, waitControl);
            await this.humanDelay();
        }

        // PASO 3: MEDICAID
        if (startAtStep <= 3) {
            console.log("🚀 Paso 3: Medicaid...");
            res = await handleMedicaid(this.page, waitControl);
            await this.humanDelay();
        }

        // PASO 4: FINAL
        if (startAtStep <= 4) {
            console.log("🚀 Paso 4: Finalizando proceso...");
            res = await handleFinalSteps(this.page, data, waitControl);
        }

        return res;
    }
}
