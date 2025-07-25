import { ttdl } from 'ruhend-scraper';
import axios from 'axios';
import chalk from 'chalk';

export async function eksekusi(danSaiyan, pesan) {
  try {
    const link = pesan.text;
    if (!link) {
      return pesan.reply('masukanblinknya contoh\n\ !ttdl ');
    }

    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.wait, key: pesan.key }
    });

    const hasil = await ttdl(link);
    const linkVideo = hasil.video;

    if (!linkVideo) {
      throw new Error('hhshshhs');
    }

    const res = await axios.get(linkVideo, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(res.data, 'binary');

    await danSaiyan.sendMessage(
      pesan.chatId,
      {
        video: videoBuffer,
        caption: `*judul* ${hasil.title}\n*uploader* ${hasil.author}`
      },
      { quoted: pesan }
    );

    await danSaiyan.sendMessage(pesan.chatId, {
        react: { text: global.dan.emojicuy.success, key: pesan.key }
    });

  } catch (err) {
    console.error(chalk.red('error ttdl'), err);
    await pesan.reply('npm error');
    await danSaiyan.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
  }
}

eksekusi.command = ['ttdl'];
eksekusi.tags = ['downloader'];
