export async function eksekusi(danSaiyan, pesan) {
  const userId = pesan.senderId;
  const userDaf = global.db.data.users.find((user) => user.id === userId);
  if (userDaf) {
    return pesan.reply('kmu dah daftar sebelumnya');
  }
  global.db.data.users.push({
    id: userId,
    name: pesan.pushName,
    xp: 1,
    uang: 100
  });
  await global.db.write();
  await pesan.reply("kmu terdaftar...")
  
}

eksekusi.command = ['daftar'];
eksekusi.tags = ['main'];
