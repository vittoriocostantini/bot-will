/**
 * Función especializada en extraer el Application ID de la pantalla de duplicados
 * o de cualquier pantalla de error/éxito de USAC.
 */
export async function extractDuplicateID(page) {
  console.log("   🔍 Intentando extraer Application ID...");

  // Selectores donde USAC suele poner el ID en la pantalla de duplicado
  const targetSelectors = [
      '.indi-review-box__provider--application-id strong',
      '.indi-review-box__provider--detail strong',
      'p:has-text("Application ID:") strong',
      'strong.ng-binding',
      '.indi-review-box__item strong'
  ];

  for (const selector of targetSelectors) {
      try {
          const locator = page.locator(selector);
          const count = await locator.count();

          for (let i = 0; i < count; i++) {
              const text = await locator.nth(i).innerText({ timeout: 2000 }).catch(() => '');
              const cleanedText = text.trim();

              // 1. Buscar formato completo: Q12345-67890
              const matchFull = cleanedText.match(/[A-Z]\d{5,}-\d+/);
              if (matchFull) {
                  console.log(`   ✅ ID Encontrado (Formato Completo): ${matchFull[0]}`);
                  return matchFull[0];
              }

              // 2. Buscar formato simple: Q12345 (por si no tiene guion)
              const matchSimple = cleanedText.match(/[A-Z]\d{5,}/);
              if (matchSimple) {
                  console.log(`   ✅ ID Encontrado (Formato Simple): ${matchSimple[0]}`);
                  return matchSimple[0];
              }
          }
      } catch (e) {
          // Continuar al siguiente selector si este falla
          continue;
      }
  }

  console.log("   ⚠️ No se pudo encontrar un ID válido en la pantalla.");
  return null;
}
