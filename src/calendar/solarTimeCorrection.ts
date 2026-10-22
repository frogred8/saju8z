import { addMinutes } from "./dateMath.js";
import type { PillarCalculationInput, LocalDateTime } from "../domain/types.js";

export function applySolarTimeCorrection(input: PillarCalculationInput): LocalDateTime {
  return addMinutes(input, input.solarTimeCorrectionMinutes);
}
