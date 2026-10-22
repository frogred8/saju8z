import assert from "node:assert/strict";
import process from "node:process";
import console from "node:console";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const workspace = await mkdtemp(join(tmpdir(), "saju8z-package-"));
const input = { date: "2000-02-29", time: "00:10", gmt: "+09:00" };
const expectedPromptChart = (
  await readFile(join(root, "test/fixtures/prompt-chart.txt"), "utf8")
).trimEnd();
const consumer = `
import assert from "node:assert/strict";
import * as api from "saju8z";
import * as core from "saju8z/core";
import * as lunar from "saju8z/lunar";
import * as format from "saju8z/format";
assert.deepEqual(Object.keys(api).sort(), ["UserInputError", "calculateSajuChart", "formatSajuChart"]);
assert.deepEqual(Object.keys(lunar).sort(), ["hasLunarLeapMonth", "lunarMonthDays", "lunarToSolar"]);
assert.deepEqual(Object.keys(format), ["formatSajuChart"]);
const input = ${JSON.stringify(input)};
const result = api.calculateSajuChart(input);
assert.deepEqual(result.fourPillars.day, { stem: "병", branch: "진" });
assert.deepEqual(JSON.parse(api.formatSajuChart(result, "json")), result);
assert.equal(format.formatSajuChart(result), api.formatSajuChart(result, "text"));
assert.equal(api.formatSajuChart(result), ${JSON.stringify(expectedPromptChart)});
const prompt = api.formatSajuChart(result, "prompt");
assert.equal(format.formatSajuChart(result, "prompt"), prompt);
assert.ok(prompt.includes("사주팔자를 다시 계산하지 말고 제공된 정보를 사용"));
assert.ok(prompt.includes(${JSON.stringify(expectedPromptChart)}));
assert.ok(!prompt.includes(${JSON.stringify("```json")}));
assert.equal(typeof core.calculateFourPillars, "function");
assert.deepEqual(lunar.lunarToSolar(2017, 5, 1, true), { year: 2017, month: 6, day: 24 });
assert.deepEqual(api.calculateSajuChart({ ...input, date: "2017-05-01", calendar: "lunar", leapMonth: true }),
  api.calculateSajuChart({ ...input, date: "2017-06-24" }));
assert.throws(() => api.calculateSajuChart({ ...input, date: "2000-02-30" }), api.UserInputError);
assert.throws(() => api.calculateSajuChart({ ...input, date: "2017-04-01", calendar: "lunar", leapMonth: true }), api.UserInputError);
console.log(JSON.stringify(result));
`;
const types = `
import { calculateSajuChart, formatSajuChart, UserInputError } from "saju8z";
import type { SajuChartInput, SajuChartResult, SajuChartFormat } from "saju8z";
import { calculateFourPillars } from "saju8z/core";
import { lunarToSolar } from "saju8z/lunar";
import { formatSajuChart as format } from "saju8z/format";
import type { SajuChartFormat as OutputFormat } from "saju8z/format";
const input: SajuChartInput = ${JSON.stringify(input)};
const result: SajuChartResult = calculateSajuChart(input);
const output: SajuChartFormat & OutputFormat = "json";
const serialized: string = formatSajuChart(result, output);
format(result, "text");
const promptOutput: SajuChartFormat & OutputFormat = "prompt";
const promptText: string = formatSajuChart(result, promptOutput);
format(result, "prompt");
calculateFourPillars({ ...result.normalizedDateTime, solarTimeCorrectionMinutes: -30 });
lunarToSolar(2017, 5, 1, true);
new UserInputError(serialized);
// @ts-expect-error Only text, json, and prompt are supported.
formatSajuChart(result, "xml");
// @ts-expect-error GMT must be explicit.
calculateSajuChart({ date: "2000-02-29", time: "00:10" });
// @ts-expect-error Low-level functions belong to the core entrypoint.
import { calculateFourPillars as internal } from "saju8z";
`;
async function installPackedPackage() {
  execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts"], { cwd: root, stdio: "pipe" });
  execFileSync("npm", ["pack", "--ignore-scripts", "--pack-destination", workspace], {
    cwd: root,
    stdio: "pipe"
  });
  /** @type {unknown} */
  const metadata = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  if (
    !metadata ||
    typeof metadata !== "object" ||
    !("name" in metadata) ||
    typeof metadata.name !== "string" ||
    !("version" in metadata) ||
    typeof metadata.version !== "string"
  )
    throw new Error("Invalid package metadata");
  const archive = join(workspace, `${metadata.name}-${metadata.version}.tgz`);
  const files = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).trim().split("\n");
  assert.ok(
    files.every((file) =>
      /^(package\/(README\.md|LICENSE|THIRD-PARTY-LICENSES\.txt|package\.json)|package\/bin\/saju8z\.js|package\/dist\/([^/]+\.(js|cjs)|types(?:-cjs)?\/.+\.(ts|json)))$/.test(
        file
      )
    ),
    "Only documented runtime and type files should be published"
  );
  await writeFile(join(workspace, "package.json"), '{"private":true,"type":"module"}\n');
  execFileSync(
    "npm",
    ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", archive],
    { cwd: workspace, stdio: "pipe" }
  );
  const installed = join(workspace, "node_modules", "saju8z");
  return { installed, files };
}

/** @param {string} installed @param {string[]} files */
async function verifyPackageContents(installed, files) {
  assert.ok(files.includes("package/LICENSE"), "Tarball must include the MIT license");
  const license = await readFile(join(installed, "LICENSE"), "utf8");
  assert.equal(license, await readFile(join(root, "LICENSE"), "utf8"));
  assert.ok(license.startsWith("MIT License\n"));
  assert.ok(license.includes("Copyright (c) 2026 frogred8"));
  /** @type {unknown} */
  const installedMetadata = JSON.parse(await readFile(join(installed, "package.json"), "utf8"));
  assert.ok(
    installedMetadata &&
      typeof installedMetadata === "object" &&
      "license" in installedMetadata &&
      installedMetadata.license === "MIT"
  );
  const thirdParty = await readFile(join(installed, "THIRD-PARTY-LICENSES.txt"), "utf8");
  assert.equal(thirdParty, await readFile(join(root, "THIRD-PARTY-LICENSES.txt"), "utf8"));
  assert.ok(thirdParty.includes("Copyright (c) 2022 Jinil Lee"));
}

async function verifyNodeConsumers() {
  await writeFile(join(workspace, "consumer.js"), consumer);
  // Exercise actual require conditions rather than transpiling ESM imports.
  await writeFile(
    join(workspace, "consumer.cjs"),
    consumer
      .replace(
        'import assert from "node:assert/strict";',
        'const assert = require("node:assert/strict");'
      )
      .replace(/import \* as (\w+) from "([^"]+)";/g, 'const $1 = require("$2");')
  );
  let reference;
  for (const timezone of ["UTC", "Asia/Seoul", "America/New_York"]) {
    for (const extension of ["js", "cjs"]) {
      const actual = execFileSync(process.execPath, [`consumer.${extension}`], {
        cwd: workspace,
        encoding: "utf8",
        env: { ...process.env, TZ: timezone }
      });
      reference ??= actual;
      assert.equal(actual, reference);
    }
  }
  return reference;
}

/** @param {string[]} args @param {string} [timezone] */
function runCli(args, timezone = "UTC") {
  const installed = join(workspace, "node_modules", "saju8z");
  const executable =
    process.platform === "win32"
      ? process.execPath
      : join(workspace, "node_modules", ".bin", "saju8z");
  const cliArgs =
    process.platform === "win32" ? [join(installed, "bin", "saju8z.js"), ...args] : args;
  return spawnSync(executable, cliArgs, {
    cwd: workspace,
    encoding: "utf8",
    timeout: 5000,
    env: { ...process.env, TZ: timezone, NODE_OPTIONS: "", NODE_PATH: "" }
  });
}

/** @param {string} reference */
function verifyCliFormats(reference) {
  const cliArgs = ["--date", input.date, "--time", input.time, "--gmt", input.gmt];
  const text = runCli(cliArgs);
  assert.equal(text.status, 0, text.stderr || text.error?.message);
  assert.equal(text.stderr, "");
  assert.equal(text.stdout, `${expectedPromptChart}\n`);
  assert.equal(runCli([...cliArgs, "--format", "text"]).stdout, text.stdout);
  assert.equal(
    execFileSync("npm", ["exec", "--offline", "--", "saju8z", ...cliArgs], {
      cwd: workspace,
      encoding: "utf8"
    }),
    text.stdout
  );
  for (const timezone of ["UTC", "Asia/Seoul", "America/New_York"]) {
    const json = runCli([...cliArgs, "--format", "json"], timezone);
    assert.equal(json.status, 0, json.stderr);
    assert.equal(json.stderr, "");
    assert.deepEqual(JSON.parse(json.stdout), JSON.parse(reference ?? "null"));
  }
  const prompt = runCli([...cliArgs, "--format", "prompt"]);
  assert.equal(prompt.status, 0, prompt.stderr);
  assert.equal(prompt.stderr, "");
  const apiPrompt = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import { calculateSajuChart, formatSajuChart } from "saju8z";
     process.stdout.write(formatSajuChart(calculateSajuChart(${JSON.stringify(input)}), "prompt") + "\\n");`
    ],
    { cwd: workspace, encoding: "utf8" }
  );
  assert.equal(prompt.stdout, apiPrompt);
  assert.ok(prompt.stdout.includes(expectedPromptChart));
  assert.ok(!prompt.stdout.includes("```json"));
}

function verifyCliTimezoneDefaults() {
  const withoutGmt = ["--date", input.date, "--time", input.time];
  for (const [timezone, gmt] of [
    ["UTC", "+00:00"],
    ["Asia/Seoul", "+09:00"],
    ["Asia/Kathmandu", "+05:45"],
    ["Australia/Darwin", "+09:30"],
    ["Etc/GMT+5", "-05:00"],
    ["Etc/GMT+12", "-12:00"]
  ]) {
    const implicit = runCli(withoutGmt, timezone);
    const explicit = runCli([...withoutGmt, "--gmt", gmt], timezone);
    assert.equal(implicit.status, 0, implicit.stderr);
    assert.equal(explicit.status, 0, explicit.stderr);
    assert.equal(implicit.stderr, "");
    assert.equal(implicit.stdout, explicit.stdout, `Default GMT for ${timezone}`);
    const implicitJson = runCli([...withoutGmt, "--format", "json"], timezone);
    const explicitJson = runCli([...withoutGmt, "--gmt", gmt, "--format", "json"], "UTC");
    assert.equal(implicitJson.status, 0, implicitJson.stderr);
    assert.equal(explicitJson.status, 0, explicitJson.stderr);
    assert.equal(
      implicitJson.stdout,
      explicitJson.stdout,
      `JSON and explicit GMT override for ${timezone}`
    );
  }
}

function verifyCliLunarInput() {
  const lunarArgs = [
    "--date",
    "2017-05-01",
    "--time",
    "12:00",
    "--gmt",
    "+09:00",
    "--calendar",
    "lunar",
    "--leap",
    "--format",
    "json"
  ];
  const lunar = runCli(lunarArgs);
  const solar = runCli([
    "--date",
    "2017-06-24",
    "--time",
    "12:00",
    "--gmt",
    "+09:00",
    "--format",
    "json"
  ]);
  assert.equal(lunar.status, 0, lunar.stderr);
  assert.equal(solar.status, 0, solar.stderr);
  assert.equal(lunar.stdout, solar.stdout);
}

function verifyCliOptions() {
  const cliArgs = ["--date", input.date, "--time", input.time, "--gmt", input.gmt];
  const withoutGmt = ["--date", input.date, "--time", input.time];
  const negativeOffset = runCli(["--date", input.date, "--time", input.time, "--gmt", "-05:00"]);
  assert.equal(negativeOffset.status, 0, negativeOffset.stderr);
  assert.equal(
    runCli(["--date=" + input.date, "--time=" + input.time, "--gmt=-05:00"]).stdout,
    negativeOffset.stdout
  );
  for (const flag of ["--help", "-h"]) {
    const help = runCli([flag]);
    assert.equal(help.status, 0);
    assert.equal(help.stderr, "");
    assert.ok(help.stdout.includes("--format"));
    assert.ok(help.stdout.includes("prompt"));
  }
  for (const invalid of [
    [],
    ["--date"],
    [...withoutGmt, "--gmt"],
    [...withoutGmt, "--gmt="],
    [...cliArgs, "--format"],
    [...cliArgs, "--format", "xml"],
    [...cliArgs, "--unknown", "x"],
    [...cliArgs, "--date", input.date],
    [...cliArgs, "--leap"],
    [...cliArgs, "--calendar", "lunar", "--leap", "--leap"],
    ["--date", "2000-02-30", "--time", input.time, "--gmt", input.gmt],
    ["--date", input.date, "--time", "24:00", "--gmt", input.gmt],
    ["--date", input.date, "--time", input.time, "--gmt", "+14:01"],
    [...cliArgs, "--calendar", "unknown"]
  ]) {
    const error = runCli(invalid);
    assert.equal(error.status, 1, JSON.stringify(invalid));
    assert.equal(error.stdout, "");
    assert.ok(error.stderr.startsWith("saju8z:"));
  }
}

async function verifyTypes() {
  for (const extension of ["mts", "cts"])
    await writeFile(join(workspace, `types.${extension}`), types);
  execFileSync(
    process.execPath,
    [
      join(root, "node_modules/typescript/bin/tsc"),
      "--strict",
      "--noEmit",
      "--module",
      "NodeNext",
      "--target",
      "ES2022",
      "types.mts",
      "types.cts"
    ],
    { cwd: workspace, stdio: "inherit" }
  );
}

/** @param {string} reference */
async function verifyBrowser(reference) {
  const browser = await build({
    absWorkingDir: workspace,
    stdin: {
      contents: `import { calculateSajuChart, formatSajuChart } from "saju8z";
      import { lunarToSolar } from "saju8z/lunar";
      import { calculateFourPillars } from "saju8z/core";
      import { formatSajuChart as format } from "saju8z/format";
      const result = calculateSajuChart(${JSON.stringify(input)});
      if (format(result) !== formatSajuChart(result, "text")) throw new Error("Format mismatch");
      if (lunarToSolar(2017, 5, 1, true).day !== 24) throw new Error("Lunar mismatch");
      if (!calculateFourPillars) throw new Error("Missing core export");
      globalThis.text = formatSajuChart(result);
      globalThis.chart = formatSajuChart(result, "json");
      globalThis.prompt = formatSajuChart(result, "prompt");`,
      resolveDir: workspace
    },
    bundle: true,
    platform: "browser",
    format: "iife",
    write: false,
    metafile: true
  });
  assert.ok(Object.values(browser.metafile.outputs).every((output) => output.imports.length === 0));
  const context = {
    text: "",
    chart: "",
    prompt: "",
    Date: class {
      constructor() {
        throw new Error("Runtime must not read the clock");
      }
    }
  };
  runInNewContext(browser.outputFiles[0].text, context, { timeout: 5000 });
  assert.equal(context.text, expectedPromptChart);
  assert.deepEqual(JSON.parse(context.chart), JSON.parse(reference ?? "null"));
  assert.ok(context.prompt.includes("성격적으로 나타날 수 있는 경향과 강점"));
  assert.ok(context.prompt.includes(expectedPromptChart));
  assert.ok(!context.prompt.includes("```json"));
}

try {
  const { installed, files } = await installPackedPackage();
  await verifyPackageContents(installed, files);
  const reference = await verifyNodeConsumers();
  assert.ok(reference, "Node consumers must produce a reference chart");
  verifyCliFormats(reference);
  verifyCliTimezoneDefaults();
  verifyCliLunarInput();
  verifyCliOptions();
  await verifyTypes();
  await verifyBrowser(reference);
  console.log(
    "Installed tarball: ESM, CJS, NodeNext types, browser, CLI, and timezone checks passed."
  );
} finally {
  await rm(workspace, { recursive: true, force: true });
}
