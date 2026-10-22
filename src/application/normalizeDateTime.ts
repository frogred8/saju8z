import { addMinutes, isValidDate } from "../calendar/dateMath.js";
import { lunarToSolar } from "../calendar/lunar.js";
import { SUPPORTED_START_YEAR, SUPPORTED_END_YEAR } from "../config/constants.js";
import type { LocalDateTime } from "../domain/types.js";
import { UserInputError } from "../input/errors.js";

const KST_OFFSET_MINUTES = 9 * 60;

function validateSolarDate(value: LocalDateTime): void {
  if (value.year < SUPPORTED_START_YEAR || value.year > SUPPORTED_END_YEAR) {
    throw new UserInputError("양력 날짜와 GMT+09:00 환산 날짜는 1900~2100년 범위여야 합니다.");
  }
  if (!isValidDate(value.year, value.month, value.day)) {
    throw new UserInputError("유효하지 않은 양력 날짜입니다.");
  }
}

export function convertLunarDateTime(local: LocalDateTime, leapMonth: boolean): LocalDateTime {
  if (
    local.year < 1900 ||
    local.year > 2050 ||
    local.month < 1 ||
    local.month > 12 ||
    local.day < 1 ||
    local.day > 30
  ) {
    throw new UserInputError("음력 날짜는 지원 범위(1900~2050년) 안의 유효한 날짜여야 합니다.");
  }
  try {
    return { ...local, ...lunarToSolar(local.year, local.month, local.day, leapMonth) };
  } catch (error) {
    throw new UserInputError(
      error instanceof Error ? error.message : "유효하지 않은 음력 날짜입니다."
    );
  }
}

export function normalizeDateTime(
  solarDateTime: LocalDateTime,
  offsetMinutes: number
): LocalDateTime {
  validateSolarDate(solarDateTime);
  const normalized = addMinutes(solarDateTime, KST_OFFSET_MINUTES - offsetMinutes);
  validateSolarDate(normalized);
  return normalized;
}
