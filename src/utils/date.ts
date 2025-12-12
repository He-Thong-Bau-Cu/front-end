import dayjs, { Dayjs } from "dayjs";

type DateInput = string | number | Date | Dayjs | null | undefined;

interface FormatOptions {
  fallback?: string;
}

// Hàm format date theo định dạng HH:mm DD/mm/YYYY (không chỉnh múi giờ)
export const formatServerDate = (
  value: DateInput,
  options?: FormatOptions
): string => {
  const { fallback = "" } = options || {};

  if (!value) return fallback;

  try {
    const date = typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value instanceof Date
        ? value
        : (value as Dayjs).toDate();

    if (isNaN(date.getTime())) return fallback;

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return fallback;
  }
};

