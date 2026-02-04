import { handleDuplicateCase } from './DuplicatedStep.js';
import { handleReviewStep } from './ReviewStep.js';
import { handleErrorScreen } from './ErrorStep.js';

export async function handleFinalSteps(page, data, waitControl) {
    logInfo("Esperando página final...");

    const result = await Promise.race([
        page.waitForSelector('input[name="applicantSignature"]', { visible: true, timeout: 35000 }).then(() => 'FIRMA'),
        page.waitForSelector('#applicantInfoCheckbox', { visible: true, timeout: 35000 }).then(() => 'REVIEW'),
        page.waitForSelector('text=/You Qualify|approved|Contact a phone or internet company/i', { visible: true, timeout: 35000 }).then(() => 'EXITO'),
        page.waitForSelector('text="Decide if you want to:"', { visible: true, timeout: 35000 }).then(() => 'DUPLICADO'),
        page.locator(':has-text("We need more information")').first().waitFor({ state: 'visible', timeout: 35000 }).then(() => 'ERROR_INFO')
    ]).catch(() => 'TIMEOUT');

    logInfo(`🔍 Pantalla detectada: ${result}`);

    if (result === 'EXITO') {
        const id = await extractIDUniversal(page);
        logInfo(`✅ APROBADO: ${id}.`);
        await handleErrorScreen(page, true);
        return id;
    }

    if (result === 'DUPLICADO') {
        return await handleDuplicateCase(page);
    }

    if (result === 'ERROR_INFO') {
        logInfo("❌ Bloqueo detectado: Información requerida.");
        await handleErrorScreen(page, false);
        return 'DOCS_REQUIRED';
    }

    if (result === 'FIRMA') {
        logStep(5, "Rellenando datos de firma...");
        await fillSignature(page, data);

        // Espera de seguridad para que el DOM reconozca los cambios
        await page.waitForTimeout(2000);

        // SELECTORES BASADOS EN TU HTML
        const btnSelectors = [
            'button#nextErrorButton6', // Este es el que nos pasaste en el HTML
            'button#nextSuccessButton7',
            'button#nextSuccessButton9',
            'button#docUploadSubmit',
            'button.indi-button--primary:visible'
        ];

        let clickExitoso = false;
        for (const sel of btnSelectors) {
            const btn = page.locator(sel).first();
            // Verificamos que esté visible y no esté deshabilitado
            if (await btn.isVisible()) {
                logInfo(`👉 Pulsando botón de envío: ${sel}`);
                await btn.click({ force: true });
                clickExitoso = true;
                break;
            }
        }

        if (!clickExitoso) {
            logInfo("⚠️ No se detectó botón visible, forzando vía script...");
            await page.evaluate(() => {
                const b = document.querySelector('#nextErrorButton6, #nextSuccessButton7, #nextSuccessButton9, .indi-button--primary');
                if (b) b.click();
            });
        }

        await page.waitForTimeout(10000);
        return await handleFinalSteps(page, data, waitControl);
    }

    if (result === 'REVIEW') {
        await handleReviewStep(page, waitControl);
        return await handleFinalSteps(page, data, waitControl);
    }

    if (result === 'TIMEOUT') {
        logInfo("⚠️ Timeout. Buscando ID por si acaso...");
        const idEmergencia = await extractIDUniversal(page);
        if (idEmergencia) {
            await handleErrorScreen(page, true);
            return idEmergencia;
        }
        return 'TIMEOUT';
    }
}

async function fillSignature(page, data) {
    const fName = String(data['First Name'] || '').trim();
    const lName = String(data['Last Name(s)'] || '').trim();
    const initials = (fName[0] + (lName[0] || '')).toLowerCase();

    // 1. Iniciales
    const inputs = page.locator('input[id^="initial"]');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
        await inputs.nth(i).fill(initials);
        await inputs.nth(i).dispatchEvent('change');
    }

    // 2. Nombre completo
    const sigInput = page.locator('input[name="applicantSignature"]');
    await sigInput.fill(`${fName} ${lName}`);
    await sigInput.dispatchEvent('input');
    await sigInput.dispatchEvent('change');

    // 3. CHECKBOX (Selector exacto de tu HTML)
    logInfo("✅ Marcando checkbox de términos...");

    // Usamos el nombre del atributo que es único
    const cbSelector = 'input[name="applicantSignatureCheckbox"]';

    try {
        // Aseguramos que Angular vea el cambio
        await page.evaluate(() => {
            const cb = document.querySelector('input[name="applicantSignatureCheckbox"]');
            if (cb) {
                cb.scrollIntoView();
                cb.checked = true;
                cb.dispatchEvent(new Event('change', { bubbles: true }));
                cb.dispatchEvent(new Event('input', { bubbles: true }));
                cb.click(); // Algunos botones no se activan sin el evento click
            }
        });
        // Refuerzo con Playwright
        await page.locator(cbSelector).check({ force: true }).catch(() => {});
    } catch (e) {
        logInfo("⚠️ Error al marcar checkbox, continuando...");
    }
}

async function extractIDUniversal(page) {
    const sels = ['.indi-review-box__provider--detail strong', 'strong.ng-binding', 'p:has-text("Application ID") + p strong'];
    for (const s of sels) {
        try {
            const text = await page.locator(s).first().innerText({ timeout: 5000 }).catch(() => '');
            const match = text.trim().match(/[A-Z]\d{5,}-\d+/);
            if (match) return match[0];
        } catch (e) {}
    }
    const bodyText = await page.innerText('body');
    const match = bodyText.match(/[A-Z]\d{5,}-\d+/);
    return match ? match[0] : null;
}

function logInfo(msg) { console.log(`   ℹ️ ${msg}`); }
function logStep(step, msg) { console.log(`\n[PASO ${step}] ➡️ ${msg}`); }
