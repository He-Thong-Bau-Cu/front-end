import moment from 'moment-timezone';

const TARGET_OFFSET_MINUTES = -7 * 60;

const withTargetOffset = (date: Date) => {
  return moment(date).utcOffset(TARGET_OFFSET_MINUTES);
};

export const getTimeAgo = (date: Date) => {
  return withTargetOffset(date).fromNow();
};

export const formatDate = (date: Date) => {
  return withTargetOffset(date).format('DD-MM-YYYY HH:mm:ss');
};

export const formatDateOfBirth = (date: Date) => {
  return withTargetOffset(date).format('DD-MM-YYYY');
};

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