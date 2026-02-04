export async function handleMedicaid(page, waitControl) {
  try {
      // Esperamos a que la casilla de Medicaid sea visible
      await page.waitForSelector('#eligMedicaid', { visible: true, timeout: 15000 });
      await page.locator('#eligMedicaid').check({ force: true });

      const action = await waitControl("Medicaid marcado. ¿Continuar?");
      if (action === 'retry') return 'retry';

      await page.click('#govProgramNextSuccessButton');
      return 'next';
  } catch (e) {
      if (await waitControl("No apareció la pantalla de Medicaid") === 'retry') return 'retry';
      return 'next';
  }
}
