import { compareLocalDate } from "../calendar/dateMath.js";
import { getMonthBranchBySolarDate, getSolarTermDateTime } from "../calendar/solarTerms.js";
import type { SajuDateWithoutTime, ThreePillars } from "../contracts/sajuChart.js";
import { pillarFromIndex, sexagenaryIndexOfYear } from "../domain/sexagenaryCycle.js";
import { calculateDayPillarFromDate } from "./calculateDayPillar.js";
import { monthPillarFromBranch } from "./calculateMonthPillar.js";

/** Date-only policy: no GMT/minute correction; solar term dates begin the new year/month. */
export function calculateThreePillars(date: SajuDateWithoutTime): ThreePillars {
  const ipchun = getSolarTermDateTime(date.year, "ipchun");
  const pillarYear = compareLocalDate(date, ipchun) < 0 ? date.year - 1 : date.year;
  const year = pillarFromIndex(sexagenaryIndexOfYear(pillarYear));
  const month = monthPillarFromBranch(getMonthBranchBySolarDate(date), year.stem);
  const day = calculateDayPillarFromDate(date);
  return { year, month, day, hour: null };
}
