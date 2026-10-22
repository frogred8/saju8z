import type { SajuChartInput } from "../contracts/sajuChart.js";
import type { LocalDateTime } from "../domain/types.js";
import { UserInputError } from "./errors.js";

interface ParsedSajuChartInput {
  localDateTime: LocalDateTime;
  offsetMinutes: number;
  calendar: "solar" | "lunar";
  leapMonth: boolean;
}

function parseDate(value: string): Pick<LocalDateTime, "year" | "month" | "day"> {
  const match = typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new UserInputError("날짜는 YYYY-MM-DD 형식으로 입력하세요.");
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseTime(value: string): Pick<LocalDateTime, "hour" | "minute"> {
  const match = typeof value === "string" && /^(\d{2}):(\d{2})$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new UserInputError("시간은 00:00~23:59 사이의 HH:mm 형식이어야 합니다.");
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function parseGmtOffset(value: string): number {
  const match = typeof value === "string" && /^([+-])(\d{2}):(\d{2})$/.exec(value);
  if (!match || Number(match[3]) > 59) {
    throw new UserInputError("GMT는 +09:00처럼 부호를 포함한 ±HH:mm 형식이어야 합니다.");
  }
  const sign = match[1] === "-" ? -1 : 1;
  const offsetMinutes = sign * (Number(match[2]) * 60 + Number(match[3]));
  if (offsetMinutes < -12 * 60 || offsetMinutes > 14 * 60) {
    throw new UserInputError("GMT는 -12:00~+14:00 범위여야 합니다.");
  }
  return offsetMinutes;
}

export function parseSajuChartInput(input: SajuChartInput): ParsedSajuChartInput {
  if (!input || typeof input !== "object") {
    throw new UserInputError("생년월일시와 GMT를 입력하세요.");
  }
  const date = parseDate(input.date);
  const time = parseTime(input.time);
  const offsetMinutes = parseGmtOffset(input.gmt);
  const calendar = input.calendar === undefined ? "solar" : input.calendar;
  if (calendar !== "solar" && calendar !== "lunar") {
    throw new UserInputError("달력은 solar 또는 lunar여야 합니다.");
  }
  if (input.leapMonth !== undefined && typeof input.leapMonth !== "boolean") {
    throw new UserInputError("윤달 여부는 참 또는 거짓이어야 합니다.");
  }
  if (input.leapMonth && calendar !== "lunar") {
    throw new UserInputError("윤달은 음력에서만 지정할 수 있습니다.");
  }
  return {
    localDateTime: { ...date, ...time },
    offsetMinutes,
    calendar,
    leapMonth: input.leapMonth ?? false
  };
}
