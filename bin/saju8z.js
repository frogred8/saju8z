#!/usr/bin/env node
import process from "node:process";
import { createInterface } from "node:readline";
import { calculateSajuChart, formatSajuChart, UserInputError } from "../dist/index.js";

const HELP_TEXT = `사용법: saju8z
        saju8z --date YYYY-MM-DD [--time HH:mm] [--gmt ±HH:mm] [옵션]
        saju8z --dt YYYYMMDD[HHmm] [--gmt ±HH:mm] [옵션]

인자 없이 실행하면 날짜와 시각을 차례로 입력받습니다.
  날짜 예: 1998-03-05 / 시각 예: 11:00 (24시간제, 모르면 비워두고 Enter)
  대화형 입력은 양력·현재 GMT 시차·text 출력을 사용합니다.

옵션으로 실행할 때 필수 입력 (둘 중 하나):
  --dt         생년월일 8자리 (YYYYMMDD) 또는 생년월일시 12자리 (YYYYMMDDHHmm)
  --date       생년월일 (YYYY-MM-DD)
  --time       출생 시각 (선택, HH:mm, 00:00~23:59). 생략하면 삼주만 계산
  --date 또는 --dt는 필수이며, --dt와 --date·--time은 혼용할 수 없습니다.
  시간이 없으면 입력 날짜 기준으로 삼주를 계산하고 GMT 환산·-30분 보정은 생략합니다.

옵션:
  --gmt        고정 GMT 시차 (기본: 실행 환경의 현재 시차, -12:00~+14:00)
  --calendar   solar (기본) 또는 lunar (한국 음력)
  --leap       음력 윤달 지정 (--calendar lunar와 함께 사용)
  --format     text (기본 만세력 텍스트), json 또는 prompt (AI 전달용)
  --help, -h   도움말

예제:
  saju8z
  saju8z --dt 19980305
  saju8z --dt 199803051100
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

async function readInteractiveArguments() {
  const reader = createInterface({
    input: process.stdin,
    output: process.stderr,
    terminal: Boolean(process.stdin.isTTY && process.stderr.isTTY),
    crlfDelay: Infinity
  });
  const answers = reader[Symbol.asyncIterator]();
  /** @param {string} prompt */
  async function ask(prompt) {
    process.stderr.write(prompt);
    const answer = await answers.next();
    if (answer.done) {
      throw new UserInputError("입력이 종료되었습니다. --date 또는 --dt를 사용하세요.");
    }
    return answer.value.trim();
  }

  try {
    process.stderr.write("생년월일과 출생 시각을 입력하세요. 양력·현재 GMT 시차로 계산합니다.\n");
    const date = await ask("생년월일 (YYYY-MM-DD, 예: 1998-03-05): ");
    const time = await ask("출생 시각 (HH:mm, 예: 11:00 / 시간을 모르면 비워두고 Enter): ");
    return time ? ["--date", date, "--time", time] : ["--date", date];
  } finally {
    reader.close();
  }
}

const VALUE_OPTIONS = new Set(["--dt", "--date", "--time", "--gmt", "--calendar", "--format"]);

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

/** @param {Map<string, string>} values */
function resolveDateTime(values) {
  const dt = values.get("--dt");
  if (dt !== undefined) {
    if (values.has("--date") || values.has("--time")) {
      throw new UserInputError("--dt는 --date 또는 --time과 함께 사용할 수 없습니다.");
    }
    if (![8, 12].includes(dt.length) || !/^\d+$/.test(dt)) {
      throw new UserInputError(
        "--dt는 YYYYMMDD 형식의 8자리 또는 YYYYMMDDHHmm 형식의 12자리 숫자여야 합니다."
      );
    }
    return {
      date: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`,
      ...(dt.length === 12 ? { time: `${dt.slice(8, 10)}:${dt.slice(10, 12)}` } : {})
    };
  }
  const date = values.get("--date");
  const time = values.get("--time");
  if (!date) {
    throw new UserInputError("--date 또는 --dt를 입력하세요.");
  }
  return { date, ...(time === undefined ? {} : { time }) };
}

/** @param {string[]} args */
function parseArguments(args) {
  const { values, leapMonth } = parseOptions(args);
  const { date, time } = resolveDateTime(values);
  const gmt = values.get("--gmt") ?? getCurrentGmtOffset();
  const calendar = values.get("--calendar") ?? "solar";
  if (calendar !== "solar" && calendar !== "lunar")
    throw new UserInputError("달력은 solar 또는 lunar여야 합니다.");
  const format = values.get("--format") ?? "text";
  if (format !== "text" && format !== "json" && format !== "prompt")
    throw new UserInputError("출력 형식은 text, json 또는 prompt이어야 합니다.");
  return {
    input: { date, ...(time === undefined ? {} : { time }), gmt, calendar, leapMonth },
    format
  };
}

try {
  const args = process.argv.slice(2);
  const showHelp = args.length === 1 && (args[0] === "--help" || args[0] === "-h");
  if (showHelp) {
    process.stdout.write(HELP_TEXT);
  } else {
    const inputArgs = args.length === 0 ? await readInteractiveArguments() : args;
    const { input, format } = parseArguments(inputArgs);
    const result = calculateSajuChart(input);
    const leadingNewline = format === "text" ? "\n" : "";
    process.stdout.write(`${leadingNewline}${formatSajuChart(result, format)}\n`);
  }
} catch (error) {
  process.stderr.write(
    `saju8z: ${error instanceof Error ? error.message : "계산에 실패했습니다."}\n도움말: saju8z --help\n`
  );
  process.exitCode = 1;
}
