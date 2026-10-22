import { STEM_INFO } from "../domain/stems.js";
import type { FiveElement, HeavenlyStem, TenGod } from "../domain/types.js";

const GENERATES: Readonly<Record<FiveElement, FiveElement>> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木"
};

const CONTROLS: Readonly<Record<FiveElement, FiveElement>> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火"
};

export function calculateTenGod(dayStem: HeavenlyStem, targetStem: HeavenlyStem): TenGod {
  const day = STEM_INFO[dayStem];
  const target = STEM_INFO[targetStem];
  const samePolarity = day.polarity === target.polarity;

  if (day.element === target.element) return samePolarity ? "비견" : "겁재";
  if (GENERATES[day.element] === target.element) return samePolarity ? "식신" : "상관";
  if (CONTROLS[day.element] === target.element) return samePolarity ? "편재" : "정재";
  if (CONTROLS[target.element] === day.element) return samePolarity ? "편관" : "정관";
  return samePolarity ? "편인" : "정인";
}
