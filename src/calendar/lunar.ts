import CalendarModule from "korean-lunar-calendar";
// The pinned 0.4.0 constructor initializes to today's local date. Skip that
// unused default and initialize its four instance fields explicitly instead.
// Conversion methods and calendar data remain those of the original library.
interface LunarCalendar {
  setLunarDate(year: number, month: number, day: number, leap: boolean): boolean;
  getLunarCalendar(): { intercalation?: boolean };
  getSolarCalendar(): { year: number; month: number; day: number };
}
const KoreanLunarCalendar = CalendarModule as unknown as { prototype: LunarCalendar };
function createCalendar(): LunarCalendar {
  return Object.assign(Object.create(KoreanLunarCalendar.prototype) as LunarCalendar, {
    cumulativeLunarYearDays: new Map<number, number>(),
    cumulativeSolarYearDays: new Map<number, number>(),
    solarCalendar: { year: 0, month: 0, day: 0 },
    lunarCalendar: { year: 0, month: 0, day: 0, intercalation: false }
  });
}

export function lunarToSolar(year: number, month: number, day: number, leap: boolean) {
  const calendar = createCalendar();
  if (
    !calendar.setLunarDate(year, month, day, leap) ||
    calendar.getLunarCalendar().intercalation !== leap
  )
    throw new Error(
      "유효한 음력 날짜와 윤달 여부를 확인하세요. 음력은 1900~2050년 범위에서 지원합니다."
    );
  return calendar.getSolarCalendar();
}
export function lunarMonthDays(year: number, month: number, leap: boolean): number {
  try {
    lunarToSolar(year, month, 30, leap);
    return 30;
  } catch {
    return 29;
  }
}

const leapMonthByYear = new Map<number, boolean>();
export function hasLunarLeapMonth(year: number): boolean {
  if (!Number.isInteger(year) || year < 1900 || year > 2050) return false;
  const cached = leapMonthByYear.get(year);
  if (cached !== undefined) return cached;
  const calendar = createCalendar();
  const hasLeap = Array.from({ length: 12 }, (_, index) => index + 1).some(
    (month) =>
      calendar.setLunarDate(year, month, 1, true) &&
      calendar.getLunarCalendar().intercalation === true
  );
  leapMonthByYear.set(year, hasLeap);
  return hasLeap;
}
