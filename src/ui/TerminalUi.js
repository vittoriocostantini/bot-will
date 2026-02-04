import chalk from 'chalk';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import terminalImage from 'terminal-image';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TerminalUI {
    static async displayHeader(stats) {
        console.clear();

        // 1. Configuración de colores (Estética Neofetch)
        const cTitle = chalk.hex('#c299a1');
        const cLabel = chalk.hex('#c299a1');
        const cValue = chalk.hex('#ffffff');
        const user = os.userInfo().username;
        const host = os.hostname();

        // 2. Definir Contenedor Derecho (Información)
        const rightInfo = [
            `${cTitle.bold(user)}${cValue('@')}${cTitle.bold(host)}`,
            `${cLabel('--------------------------')}`,
            `${cLabel('OS:')} ${cValue('Bot Terminal Node.js')}`,
            `${cLabel('Host:')} ${cValue(os.type() + ' ' + os.arch())}`,
            `${cLabel('Kernel:')} ${cValue(os.release())}`,
            `${cLabel('Uptime:')} ${cValue(Math.floor(os.uptime() / 60) + ' mins')}`,
            `${cLabel('Status:')} ${stats.filaActual > 0 ? chalk.green('Running 🟢') : chalk.yellow('Idle 🟡')}`,
            `${cLabel('Success:')} ${chalk.greenBright(stats.exitos)}`,
            `${cLabel('Errors:')} ${chalk.redBright(stats.errores)}`,
            `${cLabel('Row:')} ${cValue(stats.filaActual)}`,
            `${cLabel('CPU:')} ${cValue(os.cpus()[0].model.split(' ')[0])}`,
            `${cLabel('Memory:')} ${cValue(((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0) + 'MiB / ' + (os.totalmem() / 1024 / 1024).toFixed(0) + 'MiB')}`,
            '',
            `${chalk.hex('#c299a1')('██')}${chalk.hex('#93a1a1')('██')}${chalk.hex('#5f8787')('██')}${chalk.hex('#dfaf87')('██')}${chalk.hex('#87afaf')('██')}${chalk.hex('#d7afaf')('██')}`
        ];

        try {
            const imagePath = path.join(__dirname, 'logo.png');
            let leftImageLines = [];

            if (fs.existsSync(imagePath)) {
                // Generamos la imagen con un tamaño controlado
                const imgData = await terminalImage.file(imagePath, { width: 40, height: 18 });
                leftImageLines = imgData.split('\n');
            } else {
                // Si no hay imagen, creamos un contenedor vacío para que el texto no se pegue a la izquierda
                leftImageLines = new Array(rightInfo.length).fill(' '.repeat(40));
            }

            // 3. RENDERIZADO LADO A LADO
            const maxLines = Math.max(leftImageLines.length, rightInfo.length);

            console.log(""); // Espacio superior
            for (let i = 0; i < maxLines; i++) {
                // Si una columna es más corta que la otra, rellenamos con espacios
                const left = leftImageLines[i] || ' '.repeat(40);
                const right = rightInfo[i] || '';

                // IMPORTANTE: Imprimimos la unión de ambos contenedores en una sola línea
                process.stdout.write(`${left}   ${right}\n`);
            }

        } catch (error) {
            // Fallback en caso de error crítico
            rightInfo.forEach(line => console.log(line));
        }

        console.log('\n' + chalk.hex('#333')('─'.repeat(80)) + '\n');
    }

    static log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        let tag = chalk.bgBlue.white(' INFO ');
        if (type === 'success') tag = chalk.bgGreen.black(' DONE ');
        if (type === 'error') tag = chalk.bgRed.white(' FAIL ');

        console.log(`  ${chalk.gray(timestamp)} ${tag} ${message}`);
    }
}
