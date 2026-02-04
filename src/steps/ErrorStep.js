export async function handleErrorScreen(page, isSilentLogout = false) {
  if (!isSilentLogout) console.log("   ❌ BLOQUEO DETECTADO: 'We need more information'");

  try {
      // 1. Intentar abrir el menú "My Account"
      // Usamos un selector múltiple por si el ID falla en la página de error
      const btnAccount = page.locator('#MyAccount_btn, button:has-text("My Account"), .dropdown-toggle').first();

      await btnAccount.waitFor({ state: 'visible', timeout: 10000 });
      // Forzamos el clic por si hay algún overlay o scroll necesario
      await btnAccount.click({ force: true });

      await page.waitForTimeout(1500); // Espera un poco a que el menú despliegue

      // 2. Intentar clic en "Sign Out"
      const linkSignOut = page.locator('a[ng-click*="signOut"], a:has-text("Sign Out")').first();

      await linkSignOut.waitFor({ state: 'visible', timeout: 7000 });
      await linkSignOut.click({ force: true });

      if (!isSilentLogout) console.log("   ✅ Sesión cerrada correctamente.");

      // Espera breve para asegurar que la web procesó el logout antes de seguir
      await page.waitForTimeout(2000);

  } catch (e) {
      // Si los botones no aparecen o fallan, limpiamos sesión de forma técnica
      if (!isSilentLogout) console.log("   ⚠️ No se pudo usar los botones de Logout. Limpiando sesión mediante Cookies...");
      await page.context().clearCookies();
      await page.context().clearPermissions();
  }

  // Retornamos el estado para que el index sepa qué pasó
  return isSilentLogout ? null : 'NEED_MORE_INFO';
}
