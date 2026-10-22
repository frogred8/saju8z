import { addMinutes } from "../calendar/dateMath.js";
import { SAJU8Z_CORRECTION_MINUTES } from "../config/saju8z.js";
import type { SajuChartInput, SajuChartResult } from "../contracts/sajuChart.js";
import { parseSajuChartInput } from "../input/parseSajuChartInput.js";
import { calculateFourPillars } from "../saju/fourPillars.js";
import { calculateTenGods } from "../saju/calculateTenGods.js";
import { convertLunarDateTime, normalizeDateTime } from "./normalizeDateTime.js";

export function calculateSajuChart(input: SajuChartInput): SajuChartResult {
  const { localDateTime, offsetMinutes, calendar, leapMonth } = parseSajuChartInput(input);
  const solarDateTime =
    calendar === "lunar" ? convertLunarDateTime(localDateTime, leapMonth) : localDateTime;
  const normalizedDateTime = normalizeDateTime(solarDateTime, offsetMinutes);
  const calculationDateTime = addMinutes(normalizedDateTime, SAJU8Z_CORRECTION_MINUTES);
  const fourPillars = calculateFourPillars({
    ...normalizedDateTime,
    solarTimeCorrectionMinutes: SAJU8Z_CORRECTION_MINUTES
  });
  return {
    normalizedDateTime,
    calculationDateTime,
    fourPillars,
    tenGods: calculateTenGods(fourPillars)
  };
}
