import { julianDayNumber } from "../calendar/dateMath.js";
import { pillarFromIndex, positiveModulo } from "../domain/sexagenaryCycle.js";
import type { LocalDateTime, Pillar } from "../domain/types.js";

const JDN_TO_SEXAGENARY_OFFSET = 49;

export function calculateDayPillar(dateTime: LocalDateTime): Pillar {
  const jdn = julianDayNumber(dateTime.year, dateTime.month, dateTime.day);
  return pillarFromIndex(positiveModulo(jdn + JDN_TO_SEXAGENARY_OFFSET, 60));
}
