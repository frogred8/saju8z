import { formatLocalDateTime } from "../calendar/dateMath.js";
import { SAJU8Z_CORRECTION_MINUTES } from "../config/saju8z.js";
import type { SajuChartResult, SajuDateWithoutTime } from "../contracts/sajuChart.js";
import type { LocalDateTime } from "../domain/types.js";
import { describePillar, formatDayStem } from "./chartPresentation.js";

function formatDateTime(value: LocalDateTime | SajuDateWithoutTime): string {
  if (value.hour === null) {
    return `${String(value.year).padStart(4, "0")}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
  }
  return formatLocalDateTime(value).replace("T", " ");
}

export function formatSajuText(result: SajuChartResult): string {
  const lines = [
    "[만세력]",
    ...(result.normalizedDateTime.hour === null
      ? [
          `양력 날짜: ${formatDateTime(result.normalizedDateTime)}`,
          "출생 시각: 미상 (시간없는 사주만 제공하며 시주는 추정하거나 해석하지 않습니다.)",
          "시간 미상으로 GMT 환산과 -30분 보정은 적용하지 않았습니다."
        ]
      : [
          `양력 환산 시각: ${formatDateTime(result.normalizedDateTime)} (GMT+09:00)`,
          `${SAJU8Z_CORRECTION_MINUTES}분 보정 후 계산 시각: ${formatDateTime(result.calculationDateTime)}`
        ]),
    `일간: ${formatDayStem(result.fourPillars.day.stem)}`
  ];
  for (const position of ["year", "month", "day", "hour"] as const) {
    const pillar = describePillar(result, position);
    if (pillar === null) continue;
    lines.push(
      "",
      `${pillar.label}: ${pillar.name}`,
      `- 천간: ${pillar.stem}, ${pillar.stemElement}, ${pillar.stemTenGod}`,
      `- 지지: ${pillar.branch}, ${pillar.branchElement}, ${pillar.branchTenGod}`
    );
  }
  return lines.join("\n");
}
