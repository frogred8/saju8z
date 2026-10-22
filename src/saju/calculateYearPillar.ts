import { compareLocalDateTime } from "../calendar/dateMath.js";
import { getSolarTermDateTime } from "../calendar/solarTerms.js";
import { pillarFromIndex, sexagenaryIndexOfYear } from "../domain/sexagenaryCycle.js";
import type { LocalDateTime, Pillar } from "../domain/types.js";

export function calculateYearPillar(dateTime: LocalDateTime): Pillar {
  const ipchun = getSolarTermDateTime(dateTime.year, "ipchun");
  const pillarYear = compareLocalDateTime(dateTime, ipchun) < 0 ? dateTime.year - 1 : dateTime.year;
  return pillarFromIndex(sexagenaryIndexOfYear(pillarYear));
}
