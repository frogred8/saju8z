import type { BranchInfo, EarthlyBranch } from "./types.js";

export const EARTHLY_BRANCHES = [
  "자",
  "축",
  "인",
  "묘",
  "진",
  "사",
  "오",
  "미",
  "신",
  "유",
  "술",
  "해"
] as const;

export const BRANCH_INFO: Readonly<Record<EarthlyBranch, BranchInfo>> = {
  자: {
    name: "자",
    element: "水",
    mainHiddenStem: "계",
    hiddenStems: [{ stem: "계", role: "main" }]
  },
  축: {
    name: "축",
    element: "土",
    mainHiddenStem: "기",
    hiddenStems: [
      { stem: "기", role: "main" },
      { stem: "신", role: "middle" },
      { stem: "계", role: "initial" }
    ]
  },
  인: {
    name: "인",
    element: "木",
    mainHiddenStem: "갑",
    hiddenStems: [
      { stem: "갑", role: "main" },
      { stem: "병", role: "middle" },
      { stem: "무", role: "initial" }
    ]
  },
  묘: {
    name: "묘",
    element: "木",
    mainHiddenStem: "을",
    hiddenStems: [{ stem: "을", role: "main" }]
  },
  진: {
    name: "진",
    element: "土",
    mainHiddenStem: "무",
    hiddenStems: [
      { stem: "무", role: "main" },
      { stem: "을", role: "middle" },
      { stem: "계", role: "initial" }
    ]
  },
  사: {
    name: "사",
    element: "火",
    mainHiddenStem: "병",
    hiddenStems: [
      { stem: "병", role: "main" },
      { stem: "경", role: "middle" },
      { stem: "무", role: "initial" }
    ]
  },
  오: {
    name: "오",
    element: "火",
    mainHiddenStem: "정",
    hiddenStems: [
      { stem: "정", role: "main" },
      { stem: "기", role: "middle" }
    ]
  },
  미: {
    name: "미",
    element: "土",
    mainHiddenStem: "기",
    hiddenStems: [
      { stem: "기", role: "main" },
      { stem: "정", role: "middle" },
      { stem: "을", role: "initial" }
    ]
  },
  신: {
    name: "신",
    element: "金",
    mainHiddenStem: "경",
    hiddenStems: [
      { stem: "경", role: "main" },
      { stem: "임", role: "middle" },
      { stem: "무", role: "initial" }
    ]
  },
  유: {
    name: "유",
    element: "金",
    mainHiddenStem: "신",
    hiddenStems: [{ stem: "신", role: "main" }]
  },
  술: {
    name: "술",
    element: "土",
    mainHiddenStem: "무",
    hiddenStems: [
      { stem: "무", role: "main" },
      { stem: "신", role: "middle" },
      { stem: "정", role: "initial" }
    ]
  },
  해: {
    name: "해",
    element: "水",
    mainHiddenStem: "임",
    hiddenStems: [
      { stem: "임", role: "main" },
      { stem: "갑", role: "middle" }
    ]
  }
};

export function branchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}
