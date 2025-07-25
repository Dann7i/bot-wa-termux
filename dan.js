import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  isJidNewsletter
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import './storage/project.js'; // Memuat konfigurasi global
import pino from 'pino';
import fs from 'fs';
import { readdirSync } from 'fs';
import { join } from 'path';
import qrcode from 'qrcode-terminal';
import pertanyaan from './storage/Utils/utils.js'; // Fungsi untuk pertanyaan di konsol
import messagesUpsert from './storage/messagesUpsert/messages.js'; // Logika pemrosesan pesan masuk
import { setupDatabase } from './storage/database.js'; // Fungsi setup database

// Variabel global untuk menyimpan perintah dan objek database
global.commands = new Map(); // Untuk menyimpan semua perintah bot
global.db = {}; // Objek untuk database (akan diisi oleh setupDatabase)

/**
 * Fungsi untuk memuat semua perintah dari folder 'storage/commands'.
 */
async function muatPerintah() {
  const dirPerintah = join(process.cwd(), 'storage', 'commands');
  try {
    const filePerintah = readdirSync(dirPerintah).filter((file) =>
      file.endsWith('.js')
    );
    for (const file of filePerintah) {
      try {
        const module = await import(`file://${join(dirPerintah, file)}`);
        // Yang disimpan di global.commands adalah fungsi 'eksekusi' itu sendiri,
        // bukan seluruh objek module.
        const perintah = module.eksekusi;
        if (perintah && perintah.command) {
          for (const cmd of perintah.command) {
            global.commands.set(cmd, perintah);
          }
        }
      } catch (e) {
        console.error(`Gagal memuat perintah dari ${file}:`, e);
      }
    }
    console.log(
      'Semua perintah berhasil dimuat!',
      Array.from(global.commands.keys())
    );
  } catch (e) {
    console.error(
      "Folder 'storage/commands' tidak ditemukan. Pastikan kamu sudah membuatnya."
    );
  }
}

/**
 * Fungsi utama untuk menjalankan bot WhatsApp.
 */
async function project() {
  // Setup database dan muat ke global.db
  const dbInstance = await setupDatabase(); // Panggil fungsi setupDatabase
  // global.db sudah diisi di dalam setupDatabase.js setelah db.read()
  console.log('Database berhasil dimuat!');

  // Muat semua perintah bot
  await muatPerintah();

  try {
    // Menggunakan multi-file auth state untuk menyimpan sesi
    const { state, saveCreds } = await useMultiFileAuthState('sesi');

    // Membuat instance socket WhatsApp
    const danSaiyan = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }).child({ level: 'silent' }), // Logger tidak bersuara
      shouldIgnoreJid: (jid) => isJidNewsletter(jid), // Mengabaikan JID newsletter
      syncFullHistory: false, // Tidak sync riwayat penuh
      markOnlineOnConnect: true, // Tandai online saat terhubung
      keepAliveIntervalMs: 30000, // Interval keep-alive
      defaultQueryTimeoutMs: undefined // Timeout query default
    });

    // Logika untuk koneksi pertama kali (Pairing Code atau QR Code)
    if (!danSaiyan.authState.creds.registered) {
      const jawab = await pertanyaan('Mau terhubung via Pairing Code? [y/n]: ');
      if (jawab.toLowerCase() === 'y') {
        console.log('Memulai koneksi dengan Pairing Code...');
        const nomorTelepon = await pertanyaan(
          'Masukan nomor WA-mu diawali 62: +'
        );
        const kodePairing = await danSaiyan.requestPairingCode(
          nomorTelepon.replace(/\D/g, '')
        );
        console.log('Gunakan Pairing Code ini di perangkatmu:');
        console.log(`PAIRING CODE: ${kodePairing}`);
      } else {
        console.log('Oke, silakan scan QR Code yang akan muncul...');
      }
    }

    // Event listener untuk update koneksi
    danSaiyan.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Tampilkan QR Code jika tersedia
      if (qr) {
        qrcode.generate(qr, { small: true });
      }

      // Jika koneksi terbuka
      if (connection === 'open') {
        console.log('Koneksi berhasil tersambung!');
        console.log('Bot tersambung dengan user:', danSaiyan.user);
      }

      // Jika koneksi tertutup
      if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(`Koneksi terputus, alasan: ${reason}`);

        // Handle berbagai alasan terputusnya koneksi
        if (reason === DisconnectReason.loggedOut) {
          console.log(
            "Sesi tidak valid, hapus folder 'sesi' dan jalankan ulang."
          );
          await fs.promises.rm('sesi', { recursive: true, force: true });
          process.exit(1); // Keluar dari proses
        } else if (reason === DisconnectReason.restartRequired) {
          console.log(
            'WhatsApp meminta restart, bot akan dimulai ulang oleh nodemon...'
          );
          process.exit(1); // Keluar dari proses
        }
      }
    });

    // Event listener untuk menyimpan kredensial saat ada update
    danSaiyan.ev.on('creds.update', saveCreds);

    // Event listener untuk memproses setiap pesan yang masuk
    // Pesan pertama dari array messages yang diproses
    danSaiyan.ev.on('messages.upsert', ({ messages }) =>
      messagesUpsert(danSaiyan, messages[0])
    );
  } catch (err) {
    console.error('Error project:', err);
  }
}

// Jalankan fungsi utama project
project();
