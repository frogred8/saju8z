import { describe, expect, it, vi } from "vitest";
import { calculateSajuChart, formatSajuChart, UserInputError } from "../../src/index.js";
import type { SajuChartInput } from "../../src/index.js";

const input = { date: "1998-03-05", gmt: "+09:00" };

describe("시간 미상 삼주", () => {
  it("입력 날짜를 보존하고 미상 시각과 시주·시주 십성을 null로 반환한다", () => {
    const result = calculateSajuChart(input);
    expect(result).toEqual({
      normalizedDateTime: { year: 1998, month: 3, day: 5, hour: null, minute: null },
      calculationDateTime: { year: 1998, month: 3, day: 5, hour: null, minute: null },
      fourPillars: {
        year: { stem: "무", branch: "인" },
        month: { stem: "갑", branch: "인" },
        day: { stem: "신", branch: "해" },
        hour: null
      },
      tenGods: {
        yearStem: "정인",
        yearBranch: "정재",
        monthStem: "정재",
        monthBranch: "정재",
        dayBranch: "상관",
        hourStem: null,
        hourBranch: null
      }
    });
    expect(JSON.parse(formatSajuChart(result, "json"))).toEqual(result);
    expect(result.normalizedDateTime).not.toBe(result.calculationDateTime);
  });

  it("시간을 undefined로 명시해도 삼주를 반환한다", () => {
    expect(calculateSajuChart({ ...input, time: undefined })).toEqual(calculateSajuChart(input));
  });

  it.each(["-12:00", "-05:00", "+00:00", "+05:45", "+14:00"])(
    "GMT %s에서도 날짜와 삼주를 유지한다",
    (gmt) => {
      expect(calculateSajuChart({ ...input, gmt })).toEqual(calculateSajuChart(input));
    }
  );

  it("자정 보정으로 전날의 일주를 만들지 않는다", () => {
    const dateOnly = calculateSajuChart({ ...input, date: "2000-02-29" });
    const midnight = calculateSajuChart({ ...input, date: "2000-02-29", time: "00:00" });
    expect(dateOnly.fourPillars.day).toEqual({ stem: "정", branch: "사" });
    expect(midnight.fourPillars.day).toEqual({ stem: "병", branch: "진" });
  });

  it("삼주 텍스트와 프롬프트에 추정 시각과 시주를 넣지 않는다", () => {
    const result = calculateSajuChart(input);
    const text = formatSajuChart(result);
    expect(text).toContain("양력 날짜: 1998-03-05");
    expect(text).toContain("출생 시각: 미상");
    expect(text).toContain("시주는 추정하거나 해석하지 않습니다.");
    expect(text).toContain("GMT 환산과 -30분 보정은 적용하지 않았습니다.");
    for (const format of ["text", "prompt"] as const) {
      const output = formatSajuChart(result, format);
      expect(output).not.toContain("시주:");
      expect(output).not.toContain("00:00");
      expect(output).not.toContain("GMT+09:00");
      for (const label of ["년주:", "월주:", "일주:"]) expect(output).toContain(label);
    }
    expect(formatSajuChart(result, "prompt")).toContain(text);
  });

  it.each([
    ["1983-02-03", { stem: "임", branch: "술" }, { stem: "계", branch: "축" }],
    ["1983-02-04", { stem: "계", branch: "해" }, { stem: "갑", branch: "인" }],
    ["1983-03-05", { stem: "계", branch: "해" }, { stem: "갑", branch: "인" }],
    ["1983-03-06", { stem: "계", branch: "해" }, { stem: "을", branch: "묘" }]
  ] as const)("절기 경계일 %s에 날짜 기준 년주와 월주를 적용한다", (date, year, month) => {
    const result = calculateSajuChart({ ...input, date });
    expect(result.fourPillars.year).toEqual(year);
    expect(result.fourPillars.month).toEqual(month);
  });

  it.each([
    ["2000-01-06", "축"],
    ["2000-02-04", "인"],
    ["2000-03-06", "묘"],
    ["2000-04-05", "진"],
    ["2000-05-06", "사"],
    ["2000-06-06", "오"],
    ["2000-07-07", "미"],
    ["2000-08-08", "신"],
    ["2000-09-08", "유"],
    ["2000-10-08", "술"],
    ["2000-11-08", "해"],
    ["2000-12-07", "자"]
  ])("12개 절입 날짜 %s의 월지를 적용한다", (date, branch) => {
    expect(calculateSajuChart({ ...input, date }).fourPillars.month.branch).toBe(branch);
  });

  it.each([
    ["2017-05-01", false, "2017-05-26"],
    ["2017-05-01", true, "2017-06-24"],
    ["2050-11-18", false, "2050-12-31"]
  ] as const)("음력 %s 윤달 %s를 양력으로 변환한다", (date, leapMonth, solarDate) => {
    expect(calculateSajuChart({ ...input, date, calendar: "lunar", leapMonth })).toEqual(
      calculateSajuChart({ ...input, date: solarDate })
    );
  });

  it.each(["1900-01-01", "2100-12-31"])("지원 경계 %s의 날짜를 유지한다", (date) => {
    const result = calculateSajuChart({ ...input, date, gmt: "-12:00" });
    expect(result.normalizedDateTime.hour).toBeNull();
    expect(result.calculationDateTime).toEqual(result.normalizedDateTime);
    expect(result.normalizedDateTime.year).toBe(Number(date.slice(0, 4)));
  });

  it.each([
    { date: "1899-12-31" },
    { date: "2101-01-01" },
    { date: "1998-02-30" },
    { time: "" },
    { time: null },
    { time: "25:00" },
    { gmt: "+14:01" },
    { gmt: undefined },
    { calendar: "lunar", date: "2050-11-19" }
  ])("시간 미상에서도 잘못된 입력 %j를 거부한다", (change) => {
    expect(() => calculateSajuChart({ ...input, ...change } as SajuChartInput)).toThrow(
      UserInputError
    );
  });

  it("현재 시각이나 환경 시간대를 읽지 않는다", () => {
    vi.stubGlobal(
      "Date",
      class {
        constructor() {
          throw new Error("Clock access");
        }
      }
    );
    try {
      expect(calculateSajuChart(input).fourPillars.hour).toBeNull();
      const lunar = calculateSajuChart({
        ...input,
        date: "2017-05-01",
        calendar: "lunar",
        leapMonth: true
      });
      expect(lunar.normalizedDateTime).toEqual({
        year: 2017,
        month: 6,
        day: 24,
        hour: null,
        minute: null
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
