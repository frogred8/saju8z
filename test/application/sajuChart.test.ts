import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createSajuPrompt } from "../../src/output/createSajuPrompt.js";
import { UserInputError } from "../../src/input/errors.js";
import { calculateSajuChart } from "../../src/application/calculateSajuChart.js";
import { calculateFourPillars } from "../../src/saju/fourPillars.js";
import { formatSajuChart } from "../../src/output/formatSajuChart.js";
import type { SajuChartInput } from "../../src/contracts/sajuChart.js";

const input: SajuChartInput = { date: "2000-02-29", time: "00:10", gmt: "+09:00" };

describe("독립 만세력 계산", () => {
  it("동일 결과를 텍스트와 JSON으로 직렬화한다", () => {
    const result = calculateSajuChart(input);
    expect(result).not.toHaveProperty("calculationProfile");
    for (const format of ["text", "json", "prompt"] as const)
      expect(formatSajuChart(result, format)).not.toContain("calculationProfile");
    expect(JSON.parse(formatSajuChart(result, "json"))).toEqual(result);
    expect(formatSajuChart(result, "text")).toBe(formatSajuChart(result));
    // @ts-expect-error JavaScript callers must also receive a useful error.
    expect(() => formatSajuChart(result, "xml")).toThrow(UserInputError);
  });
  it.each([
    input,
    { ...input, gmt: "-05:00" },
    { ...input, date: "2017-05-01", calendar: "lunar", leapMonth: true } as const
  ])("AI 프롬프트에 지침과 계산 결과 전체를 포함한다: %j", (value) => {
    const result = calculateSajuChart(value);
    const before = JSON.stringify(result);
    const prompt = formatSajuChart(result, "prompt");
    for (const instruction of [
      "사주팔자를 다시 계산하지 말고 제공된 정보를 사용",
      "성격적으로 나타날 수 있는 경향과 강점",
      "스트레스를 받을 때",
      "대인관계와 의사소통",
      "업무 방식과 협업",
      "스스로 확인해 볼 질문 3가지",
      "전통적 상징 해석과 실제로 확인된 사실을 구분",
      "성격이나 미래를 단정하지 말고",
      "사주 용어를 사용하지 마라",
      "10살짜리도 이해할 수 있도록 쉽게 풀어서 설명",
      "제공되지 않은 대운·세운·지장간 등의 계산 결과를 만들어내지 마라",
      "정보가 부족한 질문에는 무엇이 더 필요한지"
    ])
      expect(prompt).toContain(instruction);
    expect(prompt).toBe(createSajuPrompt(formatSajuChart(result, "text")));
    expect(prompt).toContain("[만세력]");
    expect(prompt).not.toContain("```json");
    expect(prompt).not.toContain('"fourPillars"');
    for (const position of ["year", "month", "day", "hour"] as const) {
      const { stem, branch } = result.fourPillars[position];
      expect(prompt).toContain(`${stem}${branch}(`);
      expect(prompt).toContain(result.tenGods[`${position}Branch`]);
      expect(prompt).toContain(position === "day" ? "본원" : result.tenGods[`${position}Stem`]);
    }
    expect(JSON.stringify(result)).toBe(before);
    expect(formatSajuChart(result, "prompt")).toBe(prompt);
  });
  it("기본 텍스트와 프롬프트가 같은 만세력 결과를 사용한다", () => {
    const expected = readFileSync(
      new URL("../fixtures/prompt-chart.txt", import.meta.url),
      "utf8"
    ).trimEnd();
    const result = calculateSajuChart(input);
    expect(formatSajuChart(result)).toBe(expected);
    expect(formatSajuChart(result, "text")).toBe(expected);
    expect(formatSajuChart(result, "prompt")).toBe(createSajuPrompt(expected));
  });
  it("기존 CLI -30분 규칙과 일치하고 성별이 필요 없다", () => {
    const result = calculateSajuChart(input);
    expect(result.fourPillars).toEqual(
      calculateFourPillars({
        year: 2000,
        month: 2,
        day: 29,
        hour: 0,
        minute: 10,
        solarTimeCorrectionMinutes: -30
      })
    );
    expect(result.calculationDateTime).toEqual({
      year: 2000,
      month: 2,
      day: 28,
      hour: 23,
      minute: 40
    });
  });
  it("같은 시점을 서로 다른 GMT로 주면 같은 만세력 텍스트를 반환한다", () => {
    const reference = formatSajuChart(
      calculateSajuChart({ ...input, date: "2000-03-01", time: "09:10" })
    );
    for (const [date, time, gmt] of [
      ["2000-03-01", "00:10", "+00:00"],
      ["2000-02-29", "12:10", "-12:00"],
      ["2000-03-01", "14:10", "+14:00"],
      ["2000-03-01", "05:55", "+05:45"]
    ])
      expect(formatSajuChart(calculateSajuChart({ date: date!, time: time!, gmt: gmt! }))).toBe(
        reference
      );
  });
  it.each([
    ["2000-01-01", "00:10", "+14:00", { year: 1999, month: 12, day: 31, hour: 18, minute: 40 }],
    ["2000-12-31", "23:45", "-12:00", { year: 2001, month: 1, day: 1, hour: 20, minute: 15 }]
  ] as const)("GMT와 보정의 날짜 이동을 처리한다: %s %s %s", (date, time, gmt, corrected) => {
    expect(calculateSajuChart({ date, time, gmt }).calculationDateTime).toEqual(corrected);
  });
  it("음력과 윤달을 기존 변환 결과와 동일하게 계산한다", () => {
    const ordinary = calculateSajuChart({
      date: "2017-05-01",
      time: "12:00",
      gmt: "+09:00",
      calendar: "lunar"
    });
    const leap = calculateSajuChart({
      date: "2017-05-01",
      time: "12:00",
      gmt: "+09:00",
      calendar: "lunar",
      leapMonth: true
    });
    expect(ordinary).toEqual(
      calculateSajuChart({ date: "2017-05-26", time: "12:00", gmt: "+09:00" })
    );
    expect(leap).toEqual(calculateSajuChart({ date: "2017-06-24", time: "12:00", gmt: "+09:00" }));
    expect(ordinary.fourPillars).not.toEqual(leap.fourPillars);
  });
  it("음력 마지막 지원일과 이후 날짜를 구별한다", () => {
    expect(() =>
      calculateSajuChart({ ...input, date: "2050-11-18", calendar: "lunar" })
    ).not.toThrow();
    expect(() => calculateSajuChart({ ...input, date: "2050-11-19", calendar: "lunar" })).toThrow();
  });
  it.each([
    ["1983-02-04", "05:29", "year", { stem: "임", branch: "술" }],
    ["1983-02-04", "05:30", "year", { stem: "계", branch: "해" }],
    ["1983-03-06", "05:29", "month", { stem: "갑", branch: "인" }],
    ["1983-03-06", "05:30", "month", { stem: "을", branch: "묘" }],
    ["1983-11-15", "23:29", "hour", { stem: "신", branch: "해" }],
    ["1983-11-15", "23:30", "hour", { stem: "경", branch: "자" }]
  ] as const)("보정 후 절기·시진 경계를 지킨다: %s %s", (date, time, position, pillar) => {
    expect(calculateSajuChart({ ...input, date, time }).fourPillars[position]).toEqual(pillar);
  });
  it("자정 기준 일주 경계는 -30분 보정 후 적용한다", () => {
    const before = calculateSajuChart({ ...input, time: "00:29" });
    const after = calculateSajuChart({ ...input, time: "00:30" });
    expect(before.calculationDateTime.day).toBe(28);
    expect(after.calculationDateTime.day).toBe(29);
    expect(before.fourPillars.day).not.toEqual(after.fourPillars.day);
  });
  it("지원 경계와 GMT 환산 범위를 구별한다", () => {
    expect(calculateSajuChart({ ...input, date: "1900-01-01" }).calculationDateTime.year).toBe(
      1899
    );
    expect(() => calculateSajuChart({ ...input, date: "2100-12-31", time: "23:59" })).not.toThrow();
    expect(() => calculateSajuChart({ ...input, date: "1900-01-01", gmt: "+14:00" })).toThrow(
      "1900~2100"
    );
    expect(() =>
      calculateSajuChart({ ...input, date: "2100-12-31", time: "23:59", gmt: "-12:00" })
    ).toThrow("1900~2100");
  });
  it.each([
    { date: "1900-02-29" },
    { date: "2000-02-30" },
    { date: "2000-00-01" },
    { date: "2000-13-01" },
    { date: "2000-2-29" },
    { date: "1899-12-31" },
    { time: "24:00" },
    { time: "23:60" },
    { time: "12:00:00" },
    { gmt: "9" },
    { gmt: "+14:01" },
    { gmt: "-12:01" },
    { gmt: "+05:60" },
    { calendar: "unknown" },
    { calendar: null },
    { leapMonth: "true" },
    { leapMonth: true },
    { calendar: "lunar", date: "2017-04-01", leapMonth: true },
    { calendar: "lunar", date: "2051-01-01" }
  ])("잘못된 입력을 거부한다: %j", (change) => {
    expect(() => calculateSajuChart({ ...input, ...change } as SajuChartInput)).toThrow(
      UserInputError
    );
  });
});
