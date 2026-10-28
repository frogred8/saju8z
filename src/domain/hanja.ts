import type { EarthlyBranch, HeavenlyStem, TenGod } from "./types.js";

interface HanjaReading {
  hanja: string;
  reading: string;
  reading_en: string;
}

export const STEM_HANJA: Readonly<Record<HeavenlyStem, HanjaReading>> = {
  갑: { hanja: "甲", reading: "양/목", reading_en: "Yang Wood" },
  을: { hanja: "乙", reading: "음/목", reading_en: "Yin Wood" },
  병: { hanja: "丙", reading: "양/화", reading_en: "Yang Fire" },
  정: { hanja: "丁", reading: "음/화", reading_en: "Yin Fire" },
  무: { hanja: "戊", reading: "양/토", reading_en: "Yang Earth" },
  기: { hanja: "己", reading: "음/토", reading_en: "Yin Earth" },
  경: { hanja: "庚", reading: "양/금", reading_en: "Yang Metal" },
  신: { hanja: "辛", reading: "음/금", reading_en: "Yin Metal" },
  임: { hanja: "壬", reading: "양/수", reading_en: "Yang Water" },
  계: { hanja: "癸", reading: "음/수", reading_en: "Yin Water" }
};

export const BRANCH_HANJA: Readonly<Record<EarthlyBranch, HanjaReading>> = {
  자: { hanja: "子", reading: "쥐", reading_en: "Mouse" },
  축: { hanja: "丑", reading: "소", reading_en: "Cow" },
  인: { hanja: "寅", reading: "범", reading_en: "Tiger" },
  묘: { hanja: "卯", reading: "토끼", reading_en: "Rabbit" },
  진: { hanja: "辰", reading: "용", reading_en: "Dragon" },
  사: { hanja: "巳", reading: "뱀", reading_en: "Snake" },
  오: { hanja: "午", reading: "말", reading_en: "Horse" },
  미: { hanja: "未", reading: "양", reading_en: "Sheep" },
  신: { hanja: "申", reading: "원숭이", reading_en: "Monkey" },
  유: { hanja: "酉", reading: "닭", reading_en: "Chicken" },
  술: { hanja: "戌", reading: "개", reading_en: "Dog" },
  해: { hanja: "亥", reading: "돼지", reading_en: "Pig" }
};

export const TEN_GOD_HANJA: Readonly<Record<TenGod | "본원", HanjaReading>> = {
  비견: { hanja: "比肩", reading: "견줄 비·어깨 견", reading_en: "" },
  겁재: { hanja: "劫財", reading: "위협할 겁·재물 재", reading_en: "" },
  식신: { hanja: "食神", reading: "먹을 식·귀신 신", reading_en: "" },
  상관: { hanja: "傷官", reading: "다칠 상·벼슬 관", reading_en: "" },
  편재: { hanja: "偏財", reading: "치우칠 편·재물 재", reading_en: "" },
  정재: { hanja: "正財", reading: "바를 정·재물 재", reading_en: "" },
  편관: { hanja: "偏官", reading: "치우칠 편·벼슬 관", reading_en: "" },
  정관: { hanja: "正官", reading: "바를 정·벼슬 관", reading_en: "" },
  편인: { hanja: "偏印", reading: "치우칠 편·도장 인", reading_en: "" },
  정인: { hanja: "正印", reading: "바를 정·도장 인", reading_en: "" },
  본원: { hanja: "本元", reading: "근본 본·으뜸 원", reading_en: "" }
};
