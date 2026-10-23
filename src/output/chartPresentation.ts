import type { SajuChartResult } from "../contracts/sajuChart.js";
import { BRANCH_INFO } from "../domain/branches.js";
import { BRANCH_HANJA, STEM_HANJA } from "../domain/hanja.js";
import { STEM_INFO } from "../domain/stems.js";
import type { FiveElement, FourPillars, HeavenlyStem } from "../domain/types.js";

export type PillarPosition = keyof FourPillars;

const PILLAR_LABELS: Readonly<Record<PillarPosition, string>> = {
  year: "년주",
  month: "월주",
  day: "일주",
  hour: "시주"
};

const ELEMENT_NAMES: Readonly<Record<FiveElement, string>> = {
  木: "목",
  火: "화",
  土: "토",
  金: "금",
  水: "수"
};

function formatElement(element: FiveElement): string {
  return `${ELEMENT_NAMES[element]}(${element})`;
}

export function formatDayStem(stem: HeavenlyStem): string {
  const element = STEM_INFO[stem].element;
  return `${stem}${ELEMENT_NAMES[element]}(${STEM_HANJA[stem].hanja}${element})`;
}

export function describePillar(result: SajuChartResult, position: PillarPosition) {
  const value = result.fourPillars[position];
  if (value === null) return null;
  const { stem, branch } = value;
  const stemHanja = STEM_HANJA[stem].hanja;
  const branchHanja = BRANCH_HANJA[branch].hanja;
  return {
    label: PILLAR_LABELS[position],
    name: `${stem}${branch}(${stemHanja}${branchHanja})`,
    stem: `${stem}(${stemHanja})`,
    stemElement: formatElement(STEM_INFO[stem].element),
    stemTenGod: position === "day" ? "본원" : result.tenGods[`${position}Stem`],
    branch: `${branch}(${branchHanja})`,
    branchElement: formatElement(BRANCH_INFO[branch].element),
    branchTenGod: result.tenGods[`${position}Branch`]
  };
}
