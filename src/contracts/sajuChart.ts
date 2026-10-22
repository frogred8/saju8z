import type { FourPillars, LocalDateTime, TenGodResult } from "../domain/types.js";
export type SajuChartFormat = "text" | "json" | "prompt";

export interface SajuChartInput {
  date: string;
  time: string;
  gmt: string;
  calendar?: "solar" | "lunar";
  leapMonth?: boolean;
}
export interface SajuChartResult {
  normalizedDateTime: LocalDateTime;
  calculationDateTime: LocalDateTime;
  fourPillars: FourPillars;
  tenGods: TenGodResult;
}
