import { p as tanyaAI } from '../Utils/Gemini.js'; // Mengganti tanyaAI dengan p dari Gemini.js

export async function eksekusi(danSaiyan, pesan) {
  // Menghilangkan awalan perintah seperti '!ai ' atau '!ask ' dari pesan.text
  // Contoh: Jika pesan.text adalah "!ai siapa wildan", kita ambil "siapa wildan"
  const inputPengguna = pesan.text.replace(/^(?:!ai|!ask)\s*/i, '').trim();

  if (!inputPengguna) {
    await pesan.reply('Kasih pertanyaan ya contohnya: !ai hai');
    return;
  }

  await danSaiyan.sendMessage(pesan.chatId, {
    react: { text: global.dan.emojicuy.wait, key: pesan.key }
  });

  try {
    // Memanggil fungsi p yang sudah kita sesuaikan di Utils/Gemini.js
    const jawabanAI = await tanyaAI(inputPengguna);

    await danSaiyan.sendMessage(
      pesan.chatId,
      { text: jawabanAI },
      { quoted: pesan }
    );

    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });
  } catch (err) {
    console.error('Error di perintah AI:', err);

    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });

    await pesan.reply(
      'Duh, ada masalah nih pas ngobrol sama AI. Coba lagi nanti ya'
    );
  }
}

eksekusi.command = ['ai', 'ask'];
eksekusi.tags = ['main'];