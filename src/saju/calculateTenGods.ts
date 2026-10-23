import { BRANCH_INFO } from "../domain/branches.js";
import type { FourPillars, TenGodResult } from "../domain/types.js";
import { calculateTenGod } from "./calculateTenGod.js";

export function calculateTenGods(fourPillars: FourPillars): TenGodResult {
  const dayStem = fourPillars.day.stem;
  return {
    ...calculateDateTenGods(fourPillars),
    hourStem: calculateTenGod(dayStem, fourPillars.hour.stem),
    hourBranch: calculateTenGod(dayStem, BRANCH_INFO[fourPillars.hour.branch].mainHiddenStem)
  };
}

export function calculateDateTenGods(
  fourPillars: Pick<FourPillars, "year" | "month" | "day">
): Omit<TenGodResult, "hourStem" | "hourBranch"> {
  const dayStem = fourPillars.day.stem;
  return {
    yearStem: calculateTenGod(dayStem, fourPillars.year.stem),
    yearBranch: calculateTenGod(dayStem, BRANCH_INFO[fourPillars.year.branch].mainHiddenStem),
    monthStem: calculateTenGod(dayStem, fourPillars.month.stem),
    monthBranch: calculateTenGod(dayStem, BRANCH_INFO[fourPillars.month.branch].mainHiddenStem),
    dayBranch: calculateTenGod(dayStem, BRANCH_INFO[fourPillars.day.branch].mainHiddenStem)
  };
}
