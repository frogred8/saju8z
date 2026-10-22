import { applySolarTimeCorrection } from "../calendar/solarTimeCorrection.js";
import type { PillarCalculationInput, FourPillars } from "../domain/types.js";
import { calculateDayPillar } from "./calculateDayPillar.js";
import { calculateHourPillar } from "./calculateHourPillar.js";
import { calculateMonthPillar } from "./calculateMonthPillar.js";
import { calculateYearPillar } from "./calculateYearPillar.js";

export function calculateFourPillars(input: PillarCalculationInput): FourPillars {
  const calculationDateTime = applySolarTimeCorrection(input);
  const year = calculateYearPillar(calculationDateTime);
  const month = calculateMonthPillar(calculationDateTime, year.stem);
  const day = calculateDayPillar(calculationDateTime);
  const hour = calculateHourPillar(calculationDateTime, day.stem);
  return { year, month, day, hour };
}
