import { getMonthBranchBySolarTerm } from "../calendar/solarTerms.js";
import { EARTHLY_BRANCHES, branchIndex } from "../domain/branches.js";
import { stemAt, positiveModulo } from "../domain/sexagenaryCycle.js";
import type { EarthlyBranch, HeavenlyStem, LocalDateTime, Pillar } from "../domain/types.js";

const IN_MONTH_START_STEM_BY_YEAR_STEM: Readonly<Record<HeavenlyStem, number>> = {
  갑: 2,
  기: 2,
  을: 4,
  경: 4,
  병: 6,
  신: 6,
  정: 8,
  임: 8,
  무: 0,
  계: 0
};

export function calculateMonthPillar(dateTime: LocalDateTime, yearStem: HeavenlyStem): Pillar {
  const branch = getMonthBranchBySolarTerm(dateTime);
  return monthPillarFromBranch(branch, yearStem);
}

export function monthPillarFromBranch(branch: EarthlyBranch, yearStem: HeavenlyStem): Pillar {
  const offsetFromIn = positiveModulo(branchIndex(branch) - branchIndex("인"), 12);
  const stem = stemAt(IN_MONTH_START_STEM_BY_YEAR_STEM[yearStem] + offsetFromIn);
  return { stem, branch };
}

export function monthBranchesInOrder(): readonly EarthlyBranch[] {
  return EARTHLY_BRANCHES;
}
