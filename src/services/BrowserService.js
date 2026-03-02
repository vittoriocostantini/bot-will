import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

// Inyectamos el sigilo
chromium.use(stealthPlugin());

export class BrowserService {
  static async init() {
    console.log('🚀 Iniciando Chrome en modo Ultra-Sigilo...');

    try {
      const browser = await chromium.launch({
        channel: 'chrome', // Usa tu Chrome instalado
        headless: false,   // Siempre visible para evitar bloqueos .gov
        args: [
          '--start-maximized',
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-infobars'
        ]
      });

      const context = await browser.newContext({
        viewport: null, // Necesario para que --start-maximized funcione
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });

      // Refuerzo: Borramos la huella de automatización a nivel de script
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });

      const page = await context.newPage();

      return { browser, page };
    } catch (error) {
      console.error("❌ ERROR: No se pudo iniciar el navegador.");
      console.error(error.message);
      process.exit(1);
    }
  }
}
