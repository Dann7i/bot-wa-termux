// commands/setpremcmd.js
export async function eksekusi(danSaiyan, pesan) {
  if (!pesan.isOwner) {
    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.owner, key: pesan.key }
    });
    await pesan.reply('Maaf, perintah ini hanya bisa digunakan oleh Owner!');
    return;
  }

  const args = pesan.args;
  if (args.length < 2) {
    await pesan.reply(
      `Format salah! Gunakan: ${global.dan.prefix}setpremcmd <nama_perintah> <on|off>\n` +
        `Contoh: ${global.dan.prefix}setpremcmd fiturpremium on`
    );
    return;
  }

  const namaPerintah = args[0].toLowerCase();
  const statusPremium = args[1].toLowerCase();

  if (!global.commands.has(namaPerintah)) {
    await pesan.reply(
      `Perintah *${namaPerintah}* tidak ditemukan di daftar perintah bot.`
    );
    return;
  }

  let isPremium = false;
  if (statusPremium === 'on' || statusPremium === 'true') {
    isPremium = true;
  } else if (statusPremium === 'off' || statusPremium === 'false') {
    isPremium = false;
  } else {
    await pesan.reply("Status premium harus 'on' atau 'off'.");
    return;
  }

  if (!global.db.commandSettings) {
    global.db.commandSettings = {};
  }
  global.db.commandSettings[namaPerintah] = { isPremium: isPremium };
  await global.db.save();

  await danSaiyan.sendMessage(pesan.chatId, {
    react: { text: global.dan.emojicuy.success, key: pesan.key }
  });
  await pesan.reply(
    `Status premium untuk perintah *${namaPerintah}* berhasil diubah menjadi: *${
      isPremium ? 'ON' : 'OFF'
    }*`
  );
}

eksekusi.command = ['setpremcmd'];
eksekusi.tags = ['owner'];
