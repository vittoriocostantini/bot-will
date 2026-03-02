export async function handleAccount(page, data, waitControl) {
  // 1. CLIC INICIAL: Ir al formulario de creación de cuenta
  const btnStart = 'button[ng-click="c.createAccount()"]';

  try {
    // 1. Esperamos a que el botón sea visible y esté listo para recibir clicks
    await page.waitForSelector(btnStart, { state: 'visible', timeout: 30000 });

    // 2. Click directo (es más fiable que el evaluate para disparar eventos de Angular)
    await page.click(btnStart);

    // 3. Esperamos a que cargue el siguiente campo
    await page.waitForSelector('#firstName', { visible: true, timeout: 10000 });

  } catch (e) {
    console.error("Error al intentar crear la cuenta:", e.message);
    if (await waitControl("No se pudo entrar a 'Create Account'") === 'retry') return 'retry';
  }

  // 2. DATOS PERSONALES
  console.log("   📝 Rellenando datos personales...");
  await page.fill('#firstName', String(data['First Name'] || '').trim());
  await page.fill('#lastName', String(data['Last Name(s)'] || '').trim());

  // Fecha de Nacimiento
  const partes = String(data['date of birth'] || '').split('/');
  if (partes.length === 3) {
    await page.fill('#dobMonth', partes[0].padStart(2, '0'));
    await page.fill('#dobDay', partes[1].padStart(2, '0'));
    await page.fill('#dobYear', partes[2]);
  }

  // SSN
  if (data['SSN']) {
    await page.locator('#idType_ssn').check({ force: true });
    const ssnLast4 = String(data['SSN']).replace(/-/g, '').trim().slice(-4);
    await page.fill('#ssnText', ssnLast4);
  }

  // --- SECCIÓN DE DIRECCIÓN (APT INJECTION) ---
  console.log("   🏠 Rellenando dirección...");
  await page.fill('#streetNumberName', String(data['Street Number and Name'] || '').trim());

  // Intentamos obtener el Apt de varias posibles columnas del Excel
  const rawApt = data['Apartment or Unit'] || data['Apt'] || data['Unit'] || data['Apartment'];
  const aptVal = String(rawApt || '').trim();

  if (aptVal && aptVal.toLowerCase() !== 'undefined' && aptVal !== '') {
    console.log(`      -> Inyectando Apt: "${aptVal}"`);
    const aptSelector = '#apt';

    try {
      await page.waitForSelector(aptSelector, { visible: true, timeout: 5000 });

      // Forzamos el valor directamente en el elemento y disparamos eventos de Angular
      await page.$eval(aptSelector, (el, val) => {
        el.value = val;
        // Estos eventos notifican a AngularJS que el modelo cambió
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, aptVal);

      // Un toque de teclado real para que el formulario sepa que no es un "fantasma"
      await page.focus(aptSelector);
      await page.keyboard.press('End');
      await page.keyboard.type(' ');
      await page.keyboard.press('Backspace');
    } catch (e) {
      console.log(`      ⚠️ Error al rellenar Apt: ${e.message}`);
    }
  } else {
    console.log("      ℹ️ No se detectó valor para Apt en esta fila.");
  }

  await page.fill('#city', String(data['City'] || '').trim());
  await page.selectOption('#state', { value: String(data['State'] || '').trim() });
  await page.fill('#zipcode', String(data['Zip Code'] || '').trim());

  // Pausa de 1 segundo para que la web procese la dirección antes de clickear
  await page.waitForTimeout(1000);
  await page.click('#consumerNextSuccessButton');

  // 3. CREDENCIALES
  try {
    console.log("   🔐 Configurando credenciales...");
    await page.waitForSelector('#username', { visible: true, timeout: 15000 });

    await page.fill('#username', String(data['Username'] || '').trim());
    await page.fill('#password', String(data['Password'] || '').trim());
    await page.fill('#password2', String(data['Password'] || '').trim());

    const emailVal = String(data['email address'] || '').trim();
    if (emailVal) await page.fill('#email', emailVal);

    await page.locator('#radioButton-both').check({ force: true });
    await page.locator('#applicantTermsConditionsCheckbox').check({ force: true });

  } catch (e) {
    if (await waitControl("Error en sección de credenciales") === 'retry') return 'retry';
  }

  // 4. CAPTCHA Y ENVÍO
  const action = await waitControl('Resuelve el CAPTCHA 1 y pulsa ENTER.');
  if (action === 'retry') return 'retry';

  const btnSuccess = '#consumerNextButton';
  const btnError = '#consumerNextErrorButton';
  const btnSelector = await page.locator(btnSuccess).isVisible() ? btnSuccess : btnError;

  await page.click(btnSelector, { force: true });
  console.log("   ✅ Cuenta enviada.");

  return 'next';
}
