// Kamu mungkin perlu mendefinisikan 'global.db.users' di tempat lain,
// misalnya di file utama atau di konfigurasi database kamu.
// Untuk contoh ini, saya asumsikan global.db.users sudah ada atau kamu akan membuatnya.

export function getChatHistory(chatId) {
  return `Maaf, riwayat chat untuk ID ${chatId} tidak tersedia di database bot saat ini.`;
}

export function getUserProfileData(userId) {
  // Contoh data user dummy. Kamu harus mengganti ini dengan logikamu
  // untuk mengambil data dari database sungguhan.
  const dummyUsers = [
    { id: 'user123', name: 'Budi', xp: 100, level: 5, uang: 500 },
    { id: 'user456', name: 'Ani', xp: 150, level: 7, uang: 750 }
  ];

  const user = dummyUsers.find((u) => u.id === userId); // Ganti dengan logika database kamu

  if (user) {
    return {
      id: user.id,
      name: user.name,
      xp: user.xp,
      level: user.level,
      uang: user.uang
    };
  }

  return null;
}