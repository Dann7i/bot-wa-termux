import readline from "readline";
 export default function pertanyaan(text = "") {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(`\x1b[30;1m?\x1b[0m\x20\x1b[1m${text}\x1b[0m: `, answer => {
            rl.close();
            resolve(answer);
        });
    });
}
