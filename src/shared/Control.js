import readline from 'readline';

export const waitControl = (msg) => {
    return new Promise((resolve) => {
        console.log(`\n👉 ${msg}\n   [ENTER] Continuar | [R] Reintentar`);
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);
        const onKeyPress = (str, key) => {
            if (key.name === 'return') finish('next');
            else if (key.name === 'r') finish('retry');
            else if (key.ctrl && key.name === 'c') process.exit();
        };
        const finish = (result) => {
            if (process.stdin.isTTY) process.stdin.setRawMode(false);
            process.stdin.removeListener('keypress', onKeyPress);
            resolve(result);
        };
        process.stdin.on('keypress', onKeyPress);
    });
};
