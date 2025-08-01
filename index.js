import { spawn } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

let botProcess;
let isRestarting = false;

function project() {
  console.log(chalk.cyan('Menjalankan proses bot (dan.js)...'));

  botProcess = spawn(process.argv[0], ['dan.js'], {
    stdio: 'inherit'
  });

  botProcess.on('exit', (code) => {
    botProcess = null;
    if (!isRestarting) {
      console.error(
        chalk.red(
          `Proses bot berhenti dengan kode: ${code}, mencoba restart dalam 5 detik...`
        )
      );
      setTimeout(project, 5000);
    }
  });

  botProcess.on('error', (err) => {
    console.error(chalk.red('Gagal memulai proses bot:'), err);
  });
}

const watchPath = path.join(process.cwd(), 'storage');
let restartTimeout;

fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  // --- Tambahan Logika untuk Mengabaikan Folder media/ ---
  if (filename.startsWith('media/') || filename.startsWith('sesi/')) {
    console.log(
      chalk.dim(
        `Perubahan terdeteksi di file sementara atau sesi: ${filename}. Mengabaikan restart.`
      )
    );
    return; // Abaikan perubahan di folder media/ dan sesi/
  }
  // --- Akhir Tambahan ---

  console.log(
    chalk.yellow(`\nPerubahan terdeteksi di: ${filename}. Merestart bot...`)
  );

  clearTimeout(restartTimeout);
  restartTimeout = setTimeout(() => {
    if (botProcess) {
      isRestarting = true;
      botProcess.kill();
      setTimeout(() => {
        isRestarting = false;
        project();
      }, 1000);
    }
  }, 500);
});

function shutdown() {
  if (botProcess) {
    console.log(chalk.yellow('\nMematikan bot...'));
    botProcess.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

project();
