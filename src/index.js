import { BrowserService } from './services/BrowserService.js';
import { GooglePage } from './pages/GooglePage.js';
import { ExcelService } from './services/ExcelService.js';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function start() {
    // Al iniciar, BrowserService debe estar configurado para NO usar persistencia/userDataDir
    // si quieres que no detecte sesiones previas.
    const { page, browser } = await BrowserService.init();
    const googlePage = new GooglePage(page);

    console.log("\n🤖 MODO AUTOMÁTICO INICIADO");
    const filaInicio = await question("👉 ¿Desde qué fila quieres empezar?: ");

    let filaActual = parseInt(filaInicio);
    const totalFilas = ExcelService.getTotalRows();

    console.log(`\n🚀 Procesando desde fila ${filaActual} hasta ${totalFilas}\n`);

    for (let i = filaActual; i <= totalFilas; i++) {
        const datos = ExcelService.getRowData(i);

        // Si la fila no tiene datos relevantes, saltar
        if (!datos || !datos['First Name']) {
            console.log(`⚠️ Fila ${i} parece vacía. Saltando...`);
            continue;
        }

        console.log(`\n trabajando en FILA: ${i} [${datos['First Name']} ${datos['Last Name(s)']}]`);

        try {
            // Siempre iniciamos desde el login en modo automático
            await page.goto('https://www.getinternet.gov/apply?id=nv_consumer_login&ln=RW5nbGlzaA%3D%3D');

            // Ejecutamos el proceso completo (Fase 1)
            const resultado = await googlePage.runProcessCustom(datos, 1);

            if (resultado) {
                const esID = /[A-Z]\d+-\d+/.test(resultado);
                if (esID) {
                    const esDuplicado = resultado.toString().toUpperCase().includes('DUPLICADO');
                    await ExcelService.updateRowWithStatus(i, resultado, esDuplicado);
                }
            }

            console.log(`✅ Fila ${i} procesada correctamente.`);

        } catch (error) {
            console.error(`❌ Error en fila ${i}: ${error.message}`);
            const cont = await question("¿Deseas continuar con la siguiente fila? (s/n): ");
            if (cont.toLowerCase() !== 's') break;
        }

        // Limpieza de cookies para que la siguiente fila no detecte la sesión anterior
        await page.context().clearCookies();
        console.log(`\n⌛ Esperando 3 segundos para el siguiente registro...`);
        await page.waitForTimeout(3000);
    }

    console.log("\n🏁 ¡FIN DEL ARCHIVO ALCANZADO!");
    await browser.close();
    rl.close();
}

start();
