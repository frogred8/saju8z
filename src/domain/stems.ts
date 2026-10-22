import type { HeavenlyStem, StemInfo } from "./types.js";

export const HEAVENLY_STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;

export const STEM_INFO: Readonly<Record<HeavenlyStem, StemInfo>> = {
  갑: { name: "갑", element: "木", polarity: "yang" },
  을: { name: "을", element: "木", polarity: "yin" },
  병: { name: "병", element: "火", polarity: "yang" },
  정: { name: "정", element: "火", polarity: "yin" },
  무: { name: "무", element: "土", polarity: "yang" },
  기: { name: "기", element: "土", polarity: "yin" },
  경: { name: "경", element: "金", polarity: "yang" },
  신: { name: "신", element: "金", polarity: "yin" },
  임: { name: "임", element: "水", polarity: "yang" },
  계: { name: "계", element: "水", polarity: "yin" }
};

export function stemIndex(stem: HeavenlyStem): number {
  return HEAVENLY_STEMS.indexOf(stem);
}
