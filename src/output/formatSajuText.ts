import { formatLocalDateTime } from "../calendar/dateMath.js";
import { SAJU8Z_CORRECTION_MINUTES } from "../config/saju8z.js";
import type { SajuChartResult } from "../contracts/sajuChart.js";
import type { LocalDateTime } from "../domain/types.js";
import { describePillar, formatDayStem } from "./chartPresentation.js";

function formatDateTime(value: LocalDateTime): string {
  return formatLocalDateTime(value).replace("T", " ");
}

export function formatSajuText(result: SajuChartResult): string {
  const lines = [
    "[만세력]",
    `양력 환산 시각: ${formatDateTime(result.normalizedDateTime)} (GMT+09:00)`,
    `${SAJU8Z_CORRECTION_MINUTES}분 보정 후 계산 시각: ${formatDateTime(result.calculationDateTime)}`,
    `일간: ${formatDayStem(result.fourPillars.day.stem)}`
  ];
  for (const position of ["year", "month", "day", "hour"] as const) {
    const pillar = describePillar(result, position);
    lines.push(
      "",
      `${pillar.label}: ${pillar.name}`,
      `- 천간: ${pillar.stem}, ${pillar.stemElement}, ${pillar.stemTenGod}`,
      `- 지지: ${pillar.branch}, ${pillar.branchElement}, ${pillar.branchTenGod}`
    );
  }
  return lines.join("\n");
}
