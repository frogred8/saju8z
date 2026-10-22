import { describe, expect, it } from "vitest";
import { addMinutes, isValidDate } from "../../src/calendar/dateMath.js";

describe("날짜 산술", () => {
  it("태양시 보정으로 전날 이동을 반영한다", () => {
    expect(addMinutes({ year: 1983, month: 11, day: 15, hour: 0, minute: 10 }, -30)).toEqual({
      year: 1983,
      month: 11,
      day: 14,
      hour: 23,
      minute: 40
    });
  });

  it("태양시 보정으로 다음 날 이동을 반영한다", () => {
    expect(addMinutes({ year: 1983, month: 11, day: 15, hour: 23, minute: 50 }, 25)).toEqual({
      year: 1983,
      month: 11,
      day: 16,
      hour: 0,
      minute: 15
    });
  });

  it("윤년과 평년을 구분한다", () => {
    expect(isValidDate(2000, 2, 29)).toBe(true);
    expect(isValidDate(1900, 2, 29)).toBe(false);
  });
});
