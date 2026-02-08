export async function handleMedicaid(page) {
  try {
      // 1. Espera máxima de 15 segundos a que aparezca el selector
      await page.waitForSelector('#eligMedicaid', { visible: true, timeout: 15000 });

      // 2. Marca la casilla de Medicaid
      await page.locator('#eligMedicaid').check({ force: true });
      console.log("   ✅ Medicaid marcado.");

      // 3. Tiempo de espera fijo de 2 segundos para estabilidad
      await page.waitForTimeout(2000);

      // 4. Clic automático en el botón de continuar
      await page.click('#govProgramNextSuccessButton');

      return 'next';
  } catch (e) {
      console.error("   ❌ Error o pantalla de Medicaid no encontrada.");
      return 'next';
  }
}
