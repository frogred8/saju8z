export type FiveElement = "木" | "火" | "土" | "金" | "水";
export type Polarity = "yang" | "yin";
export type HeavenlyStem = "갑" | "을" | "병" | "정" | "무" | "기" | "경" | "신" | "임" | "계";
export type EarthlyBranch =
  | "자"
  | "축"
  | "인"
  | "묘"
  | "진"
  | "사"
  | "오"
  | "미"
  | "신"
  | "유"
  | "술"
  | "해";
export type TenGod =
  | "비견"
  | "겁재"
  | "식신"
  | "상관"
  | "편재"
  | "정재"
  | "편관"
  | "정관"
  | "편인"
  | "정인";
export interface StemInfo {
  name: HeavenlyStem;
  element: FiveElement;
  polarity: Polarity;
}

export interface BranchInfo {
  name: EarthlyBranch;
  element: FiveElement;
  mainHiddenStem: HeavenlyStem;
  hiddenStems: readonly HiddenStemInfo[];
}

export type HiddenStemRole = "main" | "middle" | "initial";

export interface HiddenStemInfo {
  stem: HeavenlyStem;
  role: HiddenStemRole;
}

export interface LocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface PillarCalculationInput extends LocalDateTime {
  solarTimeCorrectionMinutes: number;
}

export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface TenGodResult {
  yearStem: TenGod;
  yearBranch: TenGod;
  monthStem: TenGod;
  monthBranch: TenGod;
  dayBranch: TenGod;
  hourStem: TenGod;
  hourBranch: TenGod;
}
