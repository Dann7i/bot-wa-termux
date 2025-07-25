// Contoh di commands/fiturpremium.js
export async function eksekusi(danSaiyan, pesan) {
  await pesan.reply("Ini adalah fitur premium!");
}

eksekusi.command = ["fiturpremium"];
eksekusi.tags = ["premium"];
