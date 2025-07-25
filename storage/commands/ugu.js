import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { UguuUploader } from '../Utils/ugu.js'; 
import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

export async function eksekusi(danSaiyan, pesan) {
  const isImage = pesan.type === 'imageMessage';
  const isQuotedImage =
    pesan.type === 'extendedTextMessage' &&
    pesan.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.imageMessage;

  if (!isImage && !isQuotedImage) {
    await pesan.reply(
      `Kirim gambar dengan caption *${global.dan.prefix}upload* atau balas gambar yang sudah ada.`
    );
    return;
  }

  await danSaiyan.sendMessage(pesan.chatId, {
    react: { text: global.dan.emojicuy.wait, key: pesan.key }
  });

  let mediaBuffer;
  let tempFilePath;

  try {
    let targetMessage = pesan.message;
    if (isQuotedImage) {
      targetMessage =
        pesan.message.extendedTextMessage.contextInfo.quotedMessage;
    }

    const stream = await downloadContentFromMessage(
      targetMessage.imageMessage,
      'image'
    );
    mediaBuffer = Buffer.from([]);
    for await (const chunk of stream) {
      mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
    }

    const fileType = await fileTypeFromBuffer(mediaBuffer);
    if (!fileType || !fileType.ext) {
      throw new Error('Could not detect image file type.');
    }
    const fileName = `temp_image_${Date.now()}.${fileType.ext}`;
    tempFilePath = path.join(process.cwd(), 'storage', 'media', fileName);

    await fs.writeFile(tempFilePath, mediaBuffer);

    // Gunakan fungsi uploader yang baru
    const publicUrl = await UguuUploader(tempFilePath);

    await pesan.reply(`Gambar berhasil diunggah:\n${publicUrl}`);

    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });
  } catch (error) {
    console.error(`Error in upload command:`, error);
    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
    await pesan.reply(`failed to upload image: ${error.message}`);
  } finally {
    // Pastikan file sementara dihapus
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (e) {
        console.error(`Failed to delete temporary file: ${e.message}`);
      }
    }
  }
}

eksekusi.command = ['up', 'upimg']; 
eksekusi.tags = ['tools'];
