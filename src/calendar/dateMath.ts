import type { LocalDateTime } from "../domain/types.js";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1] ?? 0;
}

export function isValidDate(year: number, month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

export function compareLocalDate(
  left: Pick<LocalDateTime, "year" | "month" | "day">,
  right: Pick<LocalDateTime, "year" | "month" | "day">
): number {
  return left.year - right.year || left.month - right.month || left.day - right.day;
}

export function compareLocalDateTime(left: LocalDateTime, right: LocalDateTime): number {
  const keys: Array<keyof LocalDateTime> = ["year", "month", "day", "hour", "minute"];
  for (const key of keys) {
    const difference = left[key] - right[key];
    if (difference !== 0) return difference;
  }
  return 0;
}

export function addMinutes(dateTime: LocalDateTime, minutes: number): LocalDateTime {
  let year = dateTime.year;
  let month = dateTime.month;
  let day = dateTime.day;
  let totalMinutes = dateTime.hour * MINUTES_PER_HOUR + dateTime.minute + minutes;

  while (totalMinutes < 0) {
    totalMinutes += MINUTES_PER_DAY;
    day -= 1;
    if (day < 1) {
      month -= 1;
      if (month < 1) {
        year -= 1;
        month = 12;
      }
      day = daysInMonth(year, month);
    }
  }

  while (totalMinutes >= MINUTES_PER_DAY) {
    totalMinutes -= MINUTES_PER_DAY;
    day += 1;
    if (day > daysInMonth(year, month)) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }

  return {
    year,
    month,
    day,
    hour: Math.floor(totalMinutes / MINUTES_PER_HOUR),
    minute: totalMinutes % MINUTES_PER_HOUR
  };
}

export function julianDayNumber(year: number, month: number, day: number): number {
  // Shift January and February into the preceding year for Gregorian arithmetic.
  const yearAdjustment = Math.floor((14 - month) / 12);
  const adjustedYear = year + 4800 - yearAdjustment;
  const adjustedMonth = month + 12 * yearAdjustment - 3;
  return (
    day +
    Math.floor((153 * adjustedMonth + 2) / 5) +
    365 * adjustedYear +
    Math.floor(adjustedYear / 4) -
    Math.floor(adjustedYear / 100) +
    Math.floor(adjustedYear / 400) -
    32045
  );
}

export function formatLocalDateTime(dateTime: LocalDateTime): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const date = `${dateTime.year.toString().padStart(4, "0")}-${pad(dateTime.month)}-${pad(dateTime.day)}`;
  const time = `${pad(dateTime.hour)}:${pad(dateTime.minute)}`;
  return `${date}T${time}`;
}
