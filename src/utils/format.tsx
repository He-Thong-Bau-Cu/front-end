import moment from 'moment-timezone';

export const getTimeAgo = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').fromNow();
}

export const formatDate = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
}

export const formatDateOfBirth = (date: Date) => {
  return moment(date).tz('Asia/Ho_Chi_Minh').format('DD-HH-YYYY');
}

export const formatSecondsToClock = (seconds?: number | null) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return "--:--:--";
  }
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safe % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
};
