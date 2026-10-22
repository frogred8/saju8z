import { compareLocalDateTime } from "./dateMath.js";
import type { EarthlyBranch, LocalDateTime } from "../domain/types.js";

export type SolarTermKey =
  | "ipchun"
  | "gyeongchip"
  | "cheongmyeong"
  | "ipha"
  | "mangjong"
  | "soseo"
  | "ipchu"
  | "baengno"
  | "hallo"
  | "ipdong"
  | "daeseol"
  | "sohan";

interface SolarTermRule {
  key: SolarTermKey;
  month: number;
  day: number;
  hour: number;
  minute: number;
  monthBranch: EarthlyBranch;
}

const SOLAR_TERM_RULES: readonly SolarTermRule[] = [
  { key: "ipchun", month: 2, day: 4, hour: 5, minute: 0, monthBranch: "인" },
  { key: "gyeongchip", month: 3, day: 6, hour: 5, minute: 0, monthBranch: "묘" },
  { key: "cheongmyeong", month: 4, day: 5, hour: 5, minute: 0, monthBranch: "진" },
  { key: "ipha", month: 5, day: 6, hour: 5, minute: 0, monthBranch: "사" },
  { key: "mangjong", month: 6, day: 6, hour: 5, minute: 0, monthBranch: "오" },
  { key: "soseo", month: 7, day: 7, hour: 5, minute: 0, monthBranch: "미" },
  { key: "ipchu", month: 8, day: 8, hour: 5, minute: 0, monthBranch: "신" },
  { key: "baengno", month: 9, day: 8, hour: 5, minute: 0, monthBranch: "유" },
  { key: "hallo", month: 10, day: 8, hour: 5, minute: 0, monthBranch: "술" },
  { key: "ipdong", month: 11, day: 8, hour: 5, minute: 0, monthBranch: "해" },
  { key: "daeseol", month: 12, day: 7, hour: 5, minute: 0, monthBranch: "자" },
  { key: "sohan", month: 1, day: 6, hour: 5, minute: 0, monthBranch: "축" }
] as const;

function solarTermDateTime(year: number, rule: SolarTermRule): LocalDateTime {
  return { year, month: rule.month, day: rule.day, hour: rule.hour, minute: rule.minute };
}

export function getSolarTermDateTime(year: number, key: SolarTermKey): LocalDateTime {
  const rule = SOLAR_TERM_RULES.find((item) => item.key === key);
  if (!rule) throw new Error(`지원하지 않는 절기입니다: ${key}`);
  return solarTermDateTime(year, rule);
}

export function getMonthBranchBySolarTerm(dateTime: LocalDateTime): EarthlyBranch {
  const candidates = SOLAR_TERM_RULES.map((rule) => ({
    startsAt: solarTermDateTime(dateTime.year, rule),
    branch: rule.monthBranch
  })).sort((a, b) => compareLocalDateTime(a.startsAt, b.startsAt));

  let selected: EarthlyBranch = "축";
  for (const candidate of candidates) {
    if (compareLocalDateTime(dateTime, candidate.startsAt) >= 0) selected = candidate.branch;
  }
  return selected;
}
