import { handleErrorScreen } from './ErrorStep.js';

export async function handleDuplicateCase(page) {
    console.log("   ⚠️ Procesando caso Duplicado...");

    // 1. Extraer ID
    const id = await extractIDFromDuplicatedPage(page);

    // 2. Cerrar sesión
    await handleErrorScreen(page, true);

    if (id) {
        console.log(`   ✅ ID Duplicado detectado: ${id}`);
        // CAMBIO AQUÍ: Agregamos el prefijo "DUPLICADO:"
        return 'DUPLICADO:' + id;
    } else {
        console.log(`   ❌ No se pudo extraer el ID de la pantalla de duplicado.`);
        return 'DUPLICADO_SIN_ID';
    }
}
async function extractIDFromDuplicatedPage(page) {
    // Selectores específicos de la caja de revisión de USAC
    const selectors = [
        '.indi-review-box__provider--application-id strong',
        'strong.ng-binding',
        'p:has-text("Application ID") strong'
    ];

    for (const s of selectors) {
        try {
            const text = await page.locator(s).first().innerText({ timeout: 5000 }).catch(() => '');
            // Busca el patrón: Letra Mayúscula + números + guion + números
            const match = text.trim().match(/[A-Z]\d+-\d+/);
            if (match) return match[0];
        } catch (e) { continue; }
    }
    return null;
}
