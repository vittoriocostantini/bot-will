export async function handleReviewStep(page, waitControl) {
  console.log("   🔍 PROCESANDO: Review Your Information");

  try {
      // 1. Marcar el checkbox mediante JS para asegurar el estado
      await page.evaluate(() => {
          const cb = document.querySelector('#applicantInfoCheckbox');
          if (cb && !cb.checked) cb.click();
      });

      // 2. Pausa para intervención humana (CAPTCHA)
      const action = await waitControl('Resuelve el CAPTCHA de Review y pulsa ENTER.');
      if (action === 'retry') return 'retry';

      // 3. Selección y clic del botón de envío
      const btnS = page.locator('#nextSuccessButton9');
      const btnE = page.locator('#nextErrorButton7');

      console.log("   🖱️ Pulsando botón de siguiente...");
      if (await btnS.isVisible()) {
          await btnS.click({ force: true });
      } else {
          await btnE.click({ force: true });
      }

      // --- LA ESPERA SOLICITADA ---
      console.log("   ⏳ Esperando 10 segundos para que el sistema procese el Review...");
      await page.waitForTimeout(10000);

      return 'next';

  } catch (e) {
      console.log("   ⚠️ Error en el paso de Review: " + e.message);
      return (await waitControl("¿Reintentar este paso de Review?")) === 'retry' ? 'retry' : 'next';
  }
}
