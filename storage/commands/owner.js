export async function eksekusi(danSaiyan, pesan) {
  await danSaiyan.sendMessage(pesan.chatId, {
    react: { text: global.dan.emojicuy.owner, key: pesan.key }
  });

  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${global.owner.name}\nORG:${global.dan.name};\nTEL;type=CELL;type=VOICE;waid=${global.owner.number}:+${global.owner.number}\nEND:VCARD`;

  await danSaiyan.sendMessage(
    pesan.chatId,
    { contacts: { displayName: global.owner.name, contacts: [{ vcard }] } },
    { quoted: pesan }
  );
}

eksekusi.command = ['owner'];
eksekusi.tags = ['main'];
