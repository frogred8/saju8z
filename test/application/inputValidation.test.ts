import { describe, expect, it } from "vitest";
import { calculateSajuChart } from "../../src/application/calculateSajuChart.js";
import type { SajuChartInput } from "../../src/contracts/sajuChart.js";

const validInput: SajuChartInput = { date: "2000-02-29", time: "00:10", gmt: "+09:00" };

describe("입력 검증 오류와 우선순위", () => {
  it.each([
    [null, "생년월일시와 GMT를 입력하세요."],
    [{}, "날짜는 YYYY-MM-DD 형식으로 입력하세요."],
    [{ ...validInput, date: "2000-2-29", time: "24:00" }, "날짜는 YYYY-MM-DD 형식으로 입력하세요."],
    [
      { ...validInput, time: "24:00", gmt: "invalid" },
      "시간은 00:00~23:59 사이의 HH:mm 형식이어야 합니다."
    ],
    [
      { ...validInput, gmt: "+05:60", calendar: "unknown" },
      "GMT는 +09:00처럼 부호를 포함한 ±HH:mm 형식이어야 합니다."
    ],
    [{ ...validInput, gmt: "+14:01" }, "GMT는 -12:00~+14:00 범위여야 합니다."],
    [{ ...validInput, calendar: null, leapMonth: "yes" }, "달력은 solar 또는 lunar여야 합니다."],
    [{ ...validInput, leapMonth: "yes" }, "윤달 여부는 참 또는 거짓이어야 합니다."],
    [
      { ...validInput, date: "2000-02-30", leapMonth: true },
      "윤달은 음력에서만 지정할 수 있습니다."
    ],
    [
      { ...validInput, calendar: "lunar", date: "2051-01-01" },
      "음력 날짜는 지원 범위(1900~2050년) 안의 유효한 날짜여야 합니다."
    ],
    [{ ...validInput, date: "2000-02-30" }, "유효하지 않은 양력 날짜입니다."]
  ])("잘못된 입력에 기존 오류를 반환한다: %j", (input, message) => {
    expect(() => calculateSajuChart(input as SajuChartInput)).toThrow(message);
  });

  it("음력 환산 과정에서 호출자의 입력을 변경하지 않는다", () => {
    const input = Object.freeze({
      date: "2017-05-01",
      time: "00:10",
      gmt: "+05:45",
      calendar: "lunar",
      leapMonth: true
    } as const);
    const result = calculateSajuChart(input);
    expect(input.date).toBe("2017-05-01");
    expect(result.normalizedDateTime).toEqual({
      year: 2017,
      month: 6,
      day: 24,
      hour: 3,
      minute: 25
    });
    expect(result.calculationDateTime).toEqual({
      year: 2017,
      month: 6,
      day: 24,
      hour: 2,
      minute: 55
    });
  });
});
