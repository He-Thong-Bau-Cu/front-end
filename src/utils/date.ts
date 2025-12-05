import dayjs, { Dayjs } from "dayjs";

type DateInput = string | number | Date | Dayjs | null | undefined;

const DEFAULT_OFFSET_HOURS = 7;

interface FormatOptions {
  adjustTimezone?: boolean;
  fallback?: string;
}

export const formatServerDate = (
  value: DateInput,
  format = "DD/MM/YYYY HH:mm",
  options?: FormatOptions
): string => {
  const { adjustTimezone = true, fallback = "" } = options || {};

  if (!value) return fallback;

  const parsed = dayjs(value);
  if (!parsed.isValid()) return fallback;

  const normalized = adjustTimezone ? parsed.subtract(DEFAULT_OFFSET_HOURS, "hour") : parsed;
  return normalized.format(format);
};

