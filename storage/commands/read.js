export async function eksekusi(danSaiyan, pesan) {
  try {
    if (global.dan.autoRead && pesan?.key) {
      danSaiyan.sendMessage([pesan.key]);
    }
  } catch (error) {
    console.error("fungsi autoRead error ", error);
  }
}
// ini file tinggal hapus tapi males anjir