/*
const pad = (s) => (s < 10 ? '0' + s : s);
const jam = Math.floor(seconds / 3600);
const menit = Math.floor((seconds % 3600) / 60);
const detik = Math.floor(seconds % 60);
return `${pad(jam)}h ${pad(menit)}m ${pad(detik)}s`;
*/

import { join } from 'path';
import fs from 'fs';

function formatUptime(seconds) {
  const pad = (s) => (s < 10 ? '0' + s : s);
  const jam = Math.floor(seconds / 3600);
  const menit = Math.floor((seconds % 3600) / 60);
  const detik = Math.floor(seconds % 60);
  return `${pad(jam)} Jam ${pad(menit)} Menit ${pad(detik)} Detik`;
}

export async function eksekusi(danSaiyan, pesan) {
  const { pushName } = pesan;

  const gambarPath = join(process.cwd(), 'storage', 'media', 'menu.jpg');
  const gambarBuffer = fs.readFileSync(gambarPath);

  const totalPerintah = global.commands.size;
  const waktuAktif = formatUptime(process.uptime());
  const prefix = global.dan.prefix || '!';

  const menuByCategory = {};

  for (const cmd of new Set(global.commands.values())) {
    if (!cmd.tags || cmd.tags.length === 0) continue;
    const category = cmd.tags[0].toUpperCase();
    if (!menuByCategory[category]) {
      menuByCategory[category] = [];
    }
    menuByCategory[category].push(cmd.command[0]);
  }
  let menuTeks = `
Hai *${pushName || 'User'}* ━⊜
父 *Total Perintah:* ${totalPerintah}
父 *Waktu Aktif:* ${waktuAktif}
父 *Library:* Baileys
父 *Perintah Favorit:* ${prefix}sticker
┗━━━━━━━━━━⬣
`;

  for (const category in menuByCategory) {
    menuTeks += `\n╭─「 *MENU ${category}* 」\n`;
    menuTeks += menuByCategory[category]
      .map((cmd) => `│  ◦ ${prefix}${cmd}`)
      .join('\n');
    menuTeks += `\n╰──────────\n`;
  }
  // push aja dek:)

  await danSaiyan.sendMessage(
    pesan.chatId,
    {
      image: gambarBuffer,
      caption: menuTeks.trim()
    },
    { quoted: pesan }
  );
}

eksekusi.command = ['menu', 'help'];
eksekusi.tags = ['main'];
