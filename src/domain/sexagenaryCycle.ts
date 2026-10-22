import { EARTHLY_BRANCHES } from "./branches.js";
import { HEAVENLY_STEMS } from "./stems.js";
import type { HeavenlyStem, Pillar } from "./types.js";

export function positiveModulo(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo;
}

export function pillarFromIndex(index: number): Pillar {
  const normalized = positiveModulo(index, 60);
  const stem = HEAVENLY_STEMS[normalized % 10];
  const branch = EARTHLY_BRANCHES[normalized % 12];
  if (!stem || !branch) throw new Error("유효하지 않은 60갑자 인덱스입니다.");
  return { stem, branch };
}

export function sexagenaryIndexOfYear(year: number): number {
  return positiveModulo(year - 4, 60);
}

export function formatPillar(pillar: Pillar): string {
  return `${pillar.stem}${pillar.branch}`;
}

export function sexagenaryIndexOfPillar(pillar: Pillar): number {
  const index = Array.from({ length: 60 }, (_, candidate) => candidate).find((candidate) => {
    const candidatePillar = pillarFromIndex(candidate);
    return candidatePillar.stem === pillar.stem && candidatePillar.branch === pillar.branch;
  });
  if (index === undefined) throw new Error("유효하지 않은 60갑자입니다.");
  return index;
}

export function stemAt(index: number): HeavenlyStem {
  const stem = HEAVENLY_STEMS[positiveModulo(index, 10)];
  if (!stem) throw new Error("유효하지 않은 천간 인덱스입니다.");
  return stem;
}
