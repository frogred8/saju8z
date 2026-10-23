import type { FourPillars, LocalDateTime, TenGodResult } from "../domain/types.js";
export type SajuChartFormat = "text" | "json" | "prompt";

export interface SajuChartInput {
  date: string;
  time?: string | undefined;
  gmt: string;
  calendar?: "solar" | "lunar";
  leapMonth?: boolean;
}

export type SajuDateWithoutTime = Omit<LocalDateTime, "hour" | "minute"> & {
  hour: null;
  minute: null;
};
export type ThreePillars = Omit<FourPillars, "hour"> & { hour: null };
export type ThreePillarTenGods = Omit<TenGodResult, "hourStem" | "hourBranch"> & {
  hourStem: null;
  hourBranch: null;
};

export interface SajuChartResultWithTime {
  normalizedDateTime: LocalDateTime;
  calculationDateTime: LocalDateTime;
  fourPillars: FourPillars;
  tenGods: TenGodResult;
}
export interface SajuChartResultWithoutTime {
  normalizedDateTime: SajuDateWithoutTime;
  calculationDateTime: SajuDateWithoutTime;
  fourPillars: ThreePillars;
  tenGods: ThreePillarTenGods;
}
export type SajuChartResult = SajuChartResultWithTime | SajuChartResultWithoutTime;
