import moment from 'moment-timezone';

export function getCurrentYear() {
  const now = moment().tz('Asia/Jakarta'); // Pastikan timezone ini sesuai
  const year = now.year();
  return year;
}
