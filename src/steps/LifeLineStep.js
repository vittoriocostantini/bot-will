export async function handleLifeline(page, waitControl) {
  const sel = 'button[ng-click*="startNewApplication(\'lifeline\')"]';

  try {
      console.log("   ⏳ Esperando botón de Lifeline...");
      // Esperamos a que el selector esté en el DOM
      await page.waitForSelector(sel, { state: 'attached', timeout: 15000 });

      // Forzamos que el botón sea visible y esté habilitado mediante JS antes de clickear
      await page.evaluate((s) => {
          const btn = document.querySelector(s);
          if (btn) {
              btn.removeAttribute('disabled');
              btn.scrollIntoView();
              btn.click();
          }
      }, sel);

      // Verificamos si cambió la página (buscando el checkbox de medicaid)
      // Si en 5 segundos no aparece nada, es que el clic no funcionó
      await page.waitForSelector('#eligMedicaid', { timeout: 5000 }).catch(() => null);

      return 'next';

  } catch (e) {
      const action = await waitControl("No se pudo activar el botón de Lifeline.");
      if (action === 'retry') return 'retry';
      return 'next';
  }
}
