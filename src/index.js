import { BrowserService } from './services/BrowserService.js';
import { GooglePage } from './pages/GooglePage.js';
import { ExcelService } from './services/ExcelService.js';
import chalk from 'chalk';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function start() {
    // 1. Inicialización del navegador
    const { page, browser } = await BrowserService.init();
    const googlePage = new GooglePage(page);

    console.log(chalk.cyan("\n🤖 MODO AUTOMÁTICO INICIADO"));

    // 2. Pedir fila de inicio
    const filaInicioInput = await question(chalk.yellow("👉 ¿Desde qué fila quieres empezar?: "));
    let filaActual = parseInt(filaInicioInput);

    // 3. Obtener total de filas (Importante: ahora es ASYNC)
    const totalFilas = await ExcelService.getTotalRows();

    console.log(chalk.blue(`\n🚀 Procesando desde fila ${filaActual} hasta ${totalFilas}\n`));

    for (let i = filaActual; i <= totalFilas; i++) {
        // Importante: await para obtener los datos correctamente
        const datos = await ExcelService.getRowData(i);

        if (!datos || !datos['First Name']) {
            console.log(chalk.gray(`⚠️ Fila ${i} vacía o sin nombre. Saltando...`));
            continue;
        }

        console.log(chalk.magenta(`\n[Fila ${i}]`) + ` Trabajando con: ${datos['First Name']} ${datos['Last Name(s)'] || ''}`);

        try {
            // Ir a la URL de login
            await page.goto('https://www.getinternet.gov/apply?id=nv_consumer_login&ln=RW5nbGlzaA%3D%3D');

            // Ejecutar proceso (Fase 1)
            const resultado = await googlePage.runProcessCustom(datos, 1);

            if (resultado) {
                // Verificamos si el resultado parece un ID de aplicación
                const esID = /[A-Z]\d+-\d+/.test(resultado);

                if (esID) {
                    // Verificamos si el texto contiene la palabra duplicado
                    const esDuplicado = resultado.toString().toUpperCase().includes('DUPLICADO');

                    // IMPORTANTE: await para asegurar que el color se guarde antes de seguir
                    await ExcelService.updateRowWithStatus(i, resultado, esDuplicado);

                    const colorLog = esDuplicado ? chalk.hex('#FFA500') : chalk.green;
                    console.log(colorLog(`✅ Resultado guardado en Excel como ${esDuplicado ? 'DUPLICADO (Naranja)' : 'NUEVO (Verde)'}`));
                } else {
                    console.log(chalk.yellow(`⚠️ El resultado [${resultado}] no tiene formato de ID.`));
                }
            }

            console.log(chalk.green(`✔️ Fila ${i} completada.`));

        } catch (error) {
            console.error(chalk.red(`\n❌ Error en fila ${i}: ${error.message}`));
            const cont = await question(chalk.white.bgRed(" ¿Deseas continuar con la siguiente fila? (s/n): "));
            if (cont.toLowerCase() !== 's') break;
        }

        // Limpieza de sesión para el siguiente registro
        await page.context().clearCookies();
        console.log(chalk.gray(`⌛ Esperando 3 segundos...`));
        await page.waitForTimeout(3000);
    }

    console.log(chalk.cyan.bold("\n🏁 ¡PROCESO FINALIZADO!"));
    await browser.close();
    rl.close();
}

start();
