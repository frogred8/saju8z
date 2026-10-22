import { branchIndex } from "../domain/branches.js";
import { stemAt } from "../domain/sexagenaryCycle.js";
import type { EarthlyBranch, HeavenlyStem, LocalDateTime, Pillar } from "../domain/types.js";

const ZI_HOUR_START_STEM_BY_DAY_STEM: Readonly<Record<HeavenlyStem, number>> = {
  갑: 0,
  기: 0,
  을: 2,
  경: 2,
  병: 4,
  신: 4,
  정: 6,
  임: 6,
  무: 8,
  계: 8
};

export function calculateHourBranch(dateTime: LocalDateTime): EarthlyBranch {
  const hour = dateTime.hour;
  if (hour === 23 || hour === 0) return "자";
  if (hour <= 2) return "축";
  if (hour <= 4) return "인";
  if (hour <= 6) return "묘";
  if (hour <= 8) return "진";
  if (hour <= 10) return "사";
  if (hour <= 12) return "오";
  if (hour <= 14) return "미";
  if (hour <= 16) return "신";
  if (hour <= 18) return "유";
  if (hour <= 20) return "술";
  return "해";
}

export function calculateHourPillar(dateTime: LocalDateTime, dayStem: HeavenlyStem): Pillar {
  const branch = calculateHourBranch(dateTime);
  const stem = stemAt(ZI_HOUR_START_STEM_BY_DAY_STEM[dayStem] + branchIndex(branch));
  return { stem, branch };
}
