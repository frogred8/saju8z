import CalendarModule from "korean-lunar-calendar";
import { expect, it, vi } from "vitest";
import { lunarToSolar, lunarMonthDays, hasLunarLeapMonth } from "../../src/calendar/lunar.js";
it("converts Korean lunar new year and distinguishes leap months", () => {
  expect(lunarToSolar(2024, 1, 1, false)).toEqual({ year: 2024, month: 2, day: 10 });
  expect(lunarToSolar(2017, 5, 1, true)).toEqual({ year: 2017, month: 6, day: 24 });
  expect(lunarToSolar(2017, 5, 1, false)).toEqual({ year: 2017, month: 5, day: 26 });
  expect(() => lunarToSolar(2024, 1, 1, true)).toThrow("윤달");
  expect(() => lunarToSolar(2051, 1, 1, false)).toThrow();
  expect(() => lunarToSolar(2024, 1, 31, false)).toThrow();
  expect(lunarMonthDays(2024, 1, false)).toBe(29);
});

it("detects leap years and rejects unsupported or incomplete years", () => {
  expect(hasLunarLeapMonth(1993)).toBe(true);
  expect(hasLunarLeapMonth(1994)).toBe(false);
  expect(hasLunarLeapMonth(1995)).toBe(true);
  expect(hasLunarLeapMonth(2024)).toBe(false);
  expect(hasLunarLeapMonth(2051)).toBe(false);
  expect(hasLunarLeapMonth(NaN)).toBe(false);
});

it("matches the pinned library across supported years, month lengths, and leap months", () => {
  const Calendar = CalendarModule as unknown as new () => {
    setLunarDate(year: number, month: number, day: number, leap: boolean): boolean;
    getSolarCalendar(): { year: number; month: number; day: number };
  };
  const original = new Calendar();
  for (let year = 1900; year <= 2050; year++) {
    for (let month = 1; month <= 12; month++) {
      for (const leap of [false, true]) {
        for (const day of [1, 29, 30]) {
          if (original.setLunarDate(year, month, day, leap))
            expect(lunarToSolar(year, month, day, leap)).toEqual(original.getSolarCalendar());
          else expect(() => lunarToSolar(year, month, day, leap)).toThrow();
        }
      }
    }
  }
});

it("never reads the clock when converting or checking leap months", () => {
  vi.stubGlobal(
    "Date",
    class {
      constructor() {
        throw new Error("Clock access");
      }
    }
  );
  try {
    expect(lunarToSolar(2017, 5, 1, true)).toEqual({ year: 2017, month: 6, day: 24 });
    expect(hasLunarLeapMonth(2020)).toBe(true);
    expect(lunarMonthDays(2024, 1, false)).toBe(29);
  } finally {
    vi.unstubAllGlobals();
  }
});
