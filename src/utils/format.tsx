import moment from 'moment-timezone';

const TARGET_OFFSET_MINUTES = -7 * 60;

const withTargetOffset = (date: Date) => {
  return moment(date).utcOffset(TARGET_OFFSET_MINUTES);
};

export const getTimeAgo = (date: Date) => {
  return withTargetOffset(date).fromNow();
};

const formatDateSimple = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
      hour12: false
    }).format(date).replace(',', '');
  } catch {
    return "";
  }
};

export const formatDate = (date: Date | string | null | undefined) => {
  return formatDateSimple(date);
};

export const formatDateOfBirth = (date: Date | string | null | undefined) => {
  if (!date) return "";
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
};

export const formatDatePlain = (date: Date | string | null | undefined, format = 'DD-MM-YYYY HH:mm:ss') => {
  if (format === 'DD-MM-YYYY HH:mm:ss' || format.includes('HH:mm')) {
    return formatDateSimple(date);
  }
  if (!date) return "";
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    return moment.utc(dateObj).format(format);
  } catch {
    return "";
  }
};

export const formatDateNoOffset = (date: any) => formatDateSimple(date);

export const formatDateNoOffset2 = (date: any) => formatDateSimple(date);

export const formatDateInline = (dateInput: Date | string | null | undefined): string => {
  return formatDateSimple(dateInput);
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
