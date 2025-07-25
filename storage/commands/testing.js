export async function eksekusi(danSaiyan, pesan) {
  await danSaiyan.sendMessage(pesan.chatId, { react: { text: "✅", key: pesan.key } });

  const teksBalasan = `
Halo, ${pesan.pushName || "Kak"}!
Perintah tes ini berhasil dijalankan.

Bot aktif dan siap menerima perintah selanjutnya!
    `;

  await pesan.reply(teksBalasan.trim());
}

eksekusi.command = ["tes", "test", "testing"];
eksekusi.tags = ["main"];
