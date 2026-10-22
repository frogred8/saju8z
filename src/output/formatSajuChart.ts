import type { SajuChartFormat, SajuChartResult } from "../contracts/sajuChart.js";
import { UserInputError } from "../input/errors.js";
import { createSajuPrompt } from "./createSajuPrompt.js";
import { formatSajuText } from "./formatSajuText.js";

/** Serialize a calculated chart as readable chart text (default), JSON, or an AI prompt. */
export function formatSajuChart(result: SajuChartResult, format: SajuChartFormat = "text"): string {
  switch (format) {
    case "text":
      return formatSajuText(result);
    case "json":
      return JSON.stringify(result, null, 2);
    case "prompt":
      return createSajuPrompt(formatSajuText(result));
    default:
      throw new UserInputError("출력 형식은 text, json 또는 prompt이어야 합니다.");
  }
}
