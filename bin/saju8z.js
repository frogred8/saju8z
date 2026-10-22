#!/usr/bin/env node
import process from "node:process";
import { calculateSajuChart, formatSajuChart, UserInputError } from "../dist/index.js";

const HELP_TEXT = `사용법: saju8z --date YYYY-MM-DD --time HH:mm [--gmt ±HH:mm] [옵션]

필수 입력:
  --date       생년월일 (YYYY-MM-DD)
  --time       출생 시각 (HH:mm, 00:00~23:59)

옵션:
  --gmt        고정 GMT 시차 (기본: 실행 환경의 현재 시차, -12:00~+14:00)
  --calendar   solar (기본) 또는 lunar (한국 음력)
  --leap       음력 윤달 지정 (--calendar lunar와 함께 사용)
  --format     text (기본 만세력 텍스트), json 또는 prompt (AI 전달용)
  --help, -h   도움말

예제:
  saju8z --date 2000-02-29 --time 00:10
  saju8z --date 2000-02-29 --time 00:10 --gmt +09:00
  saju8z --date 2000-02-29 --time 00:10 --gmt=-05:00 --format json
  saju8z --date 2000-02-29 --time 00:10 --format prompt
  saju8z --date 2017-05-01 --time 12:00 --gmt +09:00 --calendar lunar --leap
`;

function getCurrentGmtOffset() {
  const minutes = -new Date().getTimezoneOffset();
  const sign = minutes < 0 ? "-" : "+";
  const absolute = Math.abs(minutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const remainder = String(absolute % 60).padStart(2, "0");
  return `${sign}${hours}:${remainder}`;
}

const VALUE_OPTIONS = new Set(["--date", "--time", "--gmt", "--calendar", "--format"]);

/** @param {string[]} args */
function parseOptions(args) {
  /** @type {Map<string, string>} */
  const values = new Map();
  let leapMonth = false;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    const separator = argument.indexOf("=");
    const option = separator < 0 ? argument : argument.slice(0, separator);
    if (option === "--leap" && separator < 0) {
      if (leapMonth) throw new UserInputError("중복된 옵션입니다: --leap");
      leapMonth = true;
      continue;
    }
    if (!VALUE_OPTIONS.has(option)) throw new UserInputError(`지원하지 않는 옵션입니다: ${option}`);
    if (values.has(option)) throw new UserInputError(`중복된 옵션입니다: ${option}`);
    const value = separator < 0 ? args[++index] : argument.slice(separator + 1);
    if (!value || value.startsWith("--")) throw new UserInputError(`${option} 값을 입력하세요.`);
    values.set(option, value);
  }
  return { values, leapMonth };
}

/** @param {string[]} args */
function parseArguments(args) {
  const { values, leapMonth } = parseOptions(args);
  const date = values.get("--date");
  const time = values.get("--time");
  if (!date || !time) throw new UserInputError("--date, --time은 필수입니다.");
  const gmt = values.get("--gmt") ?? getCurrentGmtOffset();
  const calendar = values.get("--calendar") ?? "solar";
  if (calendar !== "solar" && calendar !== "lunar")
    throw new UserInputError("달력은 solar 또는 lunar여야 합니다.");
  const format = values.get("--format") ?? "text";
  if (format !== "text" && format !== "json" && format !== "prompt")
    throw new UserInputError("출력 형식은 text, json 또는 prompt이어야 합니다.");
  return { input: { date, time, gmt, calendar, leapMonth }, format };
}

try {
  const args = process.argv.slice(2);
  const showHelp = args.length === 1 && (args[0] === "--help" || args[0] === "-h");
  if (showHelp) {
    process.stdout.write(HELP_TEXT);
  } else {
    const { input, format } = parseArguments(args);
    const result = calculateSajuChart(input);
    process.stdout.write(`${formatSajuChart(result, format)}\n`);
  }
} catch (error) {
  process.stderr.write(
    `saju8z: ${error instanceof Error ? error.message : "계산에 실패했습니다."}\n도움말: saju8z --help\n`
  );
  process.exitCode = 1;
}
