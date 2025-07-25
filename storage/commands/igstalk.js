import axios from 'axios';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs/promises';
import path from 'path';

export async function eksekusi(danSaiyan, pesan) {
  if (!pesan.isOwner) {
    await pesan.reply(
      `Maaf ${pesan.pushName}, perintah ini hanya bisa digunakan oleh Owner!`
    );
    return;
  }

  const username = pesan.text;

  if (!username) {
    await pesan.reply(
      `Username Instagramnya mana? Contoh: ${global.dan.prefix}igstalk ddvn_404`
    );
    return;
  }

  await danSaiyan.sendMessage(pesan.chatId, {
    react: { text: global.dan.emojicuy.wait, key: pesan.key }
  });

  let tempFilePath;

  try {
    const apiUrl = `https://api.siputzx.my.id/api/stalk/instagram?username=${username}`;

    const response = await axios.get(apiUrl);

    if (response.status !== 200 || !response.data.status) {
      throw new Error(
        `Gagal stalk Instagram: ${response.data.message || response.statusText}`
      );
    }

    const userData = response.data.data;

    if (!userData || !userData.username) {
      throw new Error('Username tidak ditemukan atau data profil tidak valid.');
    }

    const profilePicUrl = userData.profile_pic_url;
    if (!profilePicUrl) {
      const infoTextNoPic = `
╔═══ 「 INSTAGRAM PROFILE 」
║ Username : ${userData.username} ${userData.is_verified ? '✅' : ''}
║ Full Name: ${userData.full_name || '-'}
║ Private  : ${userData.is_private ? 'Ya' : 'Tidak'}
║ Followers: ${userData.followers_count}
║ Following: ${userData.following_count}
║ Posts    : ${userData.posts_count}
║ Bio      : ${userData.biography || '-'}
╚═══════════════
      `;
      await pesan.reply(infoTextNoPic.trim());
      await danSaiyan.sendMessage(pesan.chatId, {
        react: { text: global.dan.emojicuy.success, key: pesan.key }
      });
      return;
    }

    const imageResponse = await axios.get(profilePicUrl, {
      responseType: 'arraybuffer'
    });
    const imageBuffer = Buffer.from(imageResponse.data);

    const fileName = `ig_profile_${username}_${Date.now()}.jpg`;
    tempFilePath = path.join(process.cwd(), 'storage', 'media', fileName);
    await fs.writeFile(tempFilePath, imageBuffer);

    const infoText = `
╔═══ 「 INSTAGRAM PROFILE 」
║ Username : ${userData.username} ${userData.is_verified ? '✅' : ''}
║ Full Name: ${userData.full_name || '-'}
║ Private  : ${userData.is_private ? 'Ya' : 'Tidak'}
║ Followers: ${userData.followers_count}
║ Following: ${userData.following_count}
║ Posts    : ${userData.posts_count}
║ Bio      : ${userData.biography || '-'}
╚═══════════════
    `;

    // --- PERUBAHAN KRUSIAL DI SINI ---
    // Hapus 'file://' dari URL saat mengirim gambar lokal
    await danSaiyan.sendMessage(
      pesan.chatId,
      {
        image: { url: tempFilePath }, // Cukup berikan path file lokal tanpa 'file://'
        caption: infoText.trim(),
        fileName: `${username}_profile.jpg`,
        mimetype: 'image/jpeg'
      },
      { quoted: pesan }
    );
    // --- AKHIR PERUBAHAN KRUSIAL ---

    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });
  } catch (error) {
    console.error(`Error di perintah igstalk:`, error);
    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
    await pesan.reply(
      `❌ Terjadi kesalahan saat stalk Instagram: ${error.message}\nPastikan username benar dan tidak ada masalah dengan API.`
    );
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (e) {
        console.error(`Gagal menghapus file sementara: ${e.message}`);
      }
    }
  }
}

eksekusi.command = ['igstalk', 'stalkig'];
eksekusi.tags = ['tools'];
