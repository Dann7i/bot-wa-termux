import { downloadMediaMessage } from '@whiskeysockets/baileys';

export async function eksekusi(danSaiyan, pesan) {
  const apakahOwner = global.owner.number.includes(
    pesan.senderId.split('@')[0]
  );
  if (!apakahOwner) {
    return danSaiyan.sendMessage(
      pesan.chatId,
      { text: 'kamu bukan owner bot' },
      { quoted: pesan }
    );
  }
  let targetMessage;
  const quoted = pesan.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (pesan.message?.imageMessage) {
    targetMessage = pesan;
  } else if (quoted && quoted.imageMessage) {
    targetMessage = {
      key: {
        remoteJid: pesan.key.remoteJid,
        id:
          pesan.message.extendedTextMessage.contextInfo.participant ||
          pesan.key.remoteJid
      },
      message: quoted
    };
  }
  if (!targetMessage) {
    return danSaiyan.sendMessage(
      pesan.chatId,
      {
        text: `*
    kmu mah salah cara pakainya*\n\nKirim gamabrnya dengan caption \`${global.dan.prefix}setpp\` atau kmu bisa kirim gambar dengan perintah yg sama. Terimakasih..`
      },
      { quoted: pesan }
    );
  }
  await danSaiyan.sendMessage(pesan.chatId, {
    react: { text: '⚙️', key: pesan.key }
  });
  try {
    const imageBuffer = await downloadMediaMessage(targetMessage, 'buffer', {});
    const botNolep_Jid = danSaiyan.user.id;
    await danSaiyan.updateProfilePicture(botNolep_Jid, imageBuffer);
    await danSaiyan.sendMessage(
      pesan.chatId,
      { text: 'foto profilmu berhasil diubah' },
      { quoted: pesan }
    );
  } catch (error) {
    console.error('[SET PP ERROR]', error);
    await danSaiyan.sendMessage(
      pesan.chatId,
      {
        text: `intinya lu gagal ganri profil, pastikan juga valid gambarnya:v\n\n*Rorre:* ${error.message}`
      },
      { quoted: pesan }
    );
  }
}

eksekusi.command = ['setpp', 'pp'];
eksekusi.tags = ['main'];
