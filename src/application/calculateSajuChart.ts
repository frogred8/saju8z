import { addMinutes } from "../calendar/dateMath.js";
import { SAJU8Z_CORRECTION_MINUTES } from "../config/saju8z.js";
import type {
  SajuChartInput,
  SajuChartResult,
  SajuChartResultWithTime,
  SajuChartResultWithoutTime
} from "../contracts/sajuChart.js";
import { parseSajuChartInput } from "../input/parseSajuChartInput.js";
import { calculateFourPillars } from "../saju/fourPillars.js";
import { calculateThreePillars } from "../saju/calculateThreePillars.js";
import { calculateDateTenGods, calculateTenGods } from "../saju/calculateTenGods.js";
import { convertLunarDateTime, normalizeDateTime, validateSolarDate } from "./normalizeDateTime.js";

export function calculateSajuChart(
  input: SajuChartInput & { time: string }
): SajuChartResultWithTime;
export function calculateSajuChart(
  input: SajuChartInput & { time?: undefined }
): SajuChartResultWithoutTime;
export function calculateSajuChart(input: SajuChartInput): SajuChartResult;
export function calculateSajuChart(input: SajuChartInput): SajuChartResult {
  const { localDateTime, offsetMinutes, calendar, leapMonth } = parseSajuChartInput(input);
  const solarDateTime =
    calendar === "lunar" ? convertLunarDateTime(localDateTime, leapMonth) : localDateTime;
  if (solarDateTime.hour === null) {
    validateSolarDate(solarDateTime);
    const fourPillars = calculateThreePillars(solarDateTime);
    return {
      normalizedDateTime: { ...solarDateTime },
      calculationDateTime: { ...solarDateTime },
      fourPillars,
      tenGods: { ...calculateDateTenGods(fourPillars), hourStem: null, hourBranch: null }
    };
  }
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
