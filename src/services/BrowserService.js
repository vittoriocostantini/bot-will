import { chromium } from 'playwright';

export class BrowserService {
  static async init() {
    console.log('🚀 Iniciando instancia limpia de Google Chrome...');

    try {
      const browser = await chromium.launch({
        channel: 'chrome',
        headless: false,
        args: ['--start-maximized']
      });

      const context = await browser.newContext({
        viewport: null,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      const page = await context.newPage();
      return { browser, page };
    } catch (error) {
      console.error("❌ ERROR: No se pudo iniciar Chrome automáticamente.");
      console.error(error.message);
      process.exit(1);
    }
  }
}
