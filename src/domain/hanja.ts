import type { EarthlyBranch, HeavenlyStem, TenGod } from "./types.js";

interface HanjaReading {
  hanja: string;
  reading: string;
}

export const STEM_HANJA: Readonly<Record<HeavenlyStem, HanjaReading>> = {
  갑: { hanja: "甲", reading: "갑옷 갑" },
  을: { hanja: "乙", reading: "새 을" },
  병: { hanja: "丙", reading: "남녘 병" },
  정: { hanja: "丁", reading: "고무래 정" },
  무: { hanja: "戊", reading: "무성할 무" },
  기: { hanja: "己", reading: "몸 기" },
  경: { hanja: "庚", reading: "별 경" },
  신: { hanja: "辛", reading: "매울 신" },
  임: { hanja: "壬", reading: "북방 임" },
  계: { hanja: "癸", reading: "헤아릴 계" }
};

export const BRANCH_HANJA: Readonly<Record<EarthlyBranch, HanjaReading>> = {
  자: { hanja: "子", reading: "아들 자" },
  축: { hanja: "丑", reading: "소 축" },
  인: { hanja: "寅", reading: "범 인" },
  묘: { hanja: "卯", reading: "토끼 묘" },
  진: { hanja: "辰", reading: "별 진" },
  사: { hanja: "巳", reading: "뱀 사" },
  오: { hanja: "午", reading: "낮 오" },
  미: { hanja: "未", reading: "아닐 미" },
  신: { hanja: "申", reading: "펼 신" },
  유: { hanja: "酉", reading: "닭 유" },
  술: { hanja: "戌", reading: "개 술" },
  해: { hanja: "亥", reading: "돼지 해" }
};

export const TEN_GOD_HANJA: Readonly<Record<TenGod | "본원", HanjaReading>> = {
  비견: { hanja: "比肩", reading: "견줄 비·어깨 견" },
  겁재: { hanja: "劫財", reading: "위협할 겁·재물 재" },
  식신: { hanja: "食神", reading: "먹을 식·귀신 신" },
  상관: { hanja: "傷官", reading: "다칠 상·벼슬 관" },
  편재: { hanja: "偏財", reading: "치우칠 편·재물 재" },
  정재: { hanja: "正財", reading: "바를 정·재물 재" },
  편관: { hanja: "偏官", reading: "치우칠 편·벼슬 관" },
  정관: { hanja: "正官", reading: "바를 정·벼슬 관" },
  편인: { hanja: "偏印", reading: "치우칠 편·도장 인" },
  정인: { hanja: "正印", reading: "바를 정·도장 인" },
  본원: { hanja: "本元", reading: "근본 본·으뜸 원" }
};
