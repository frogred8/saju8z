import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
const root = fileURLToPath(new URL("../", import.meta.url));

async function buildBundles() {
  for (const [format, extension] of [
    ["esm", "js"],
    ["cjs", "cjs"]
  ]) {
    const result = await build({
      absWorkingDir: root,
      entryPoints: ["src/index.ts", "src/core.ts", "src/lunar.ts", "src/format.ts"],
      bundle: true,
      platform: "neutral",
      target: "es2022",
      format: format === "esm" ? "esm" : "cjs",
      outdir: "dist",
      outExtension: { ".js": `.${extension}` },
      legalComments: "eof",
      metafile: true
    });
    if (Object.values(result.metafile.outputs).some((output) => output.imports.length))
      throw new Error("Runtime imports must be bundled; Node-only dependencies are not allowed.");
  }
}

async function buildTypeDeclarations() {
  for (const directory of ["dist/types", "dist/types-cjs"])
    await rm(resolve(root, directory), { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [resolve(root, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.build.json"],
    { cwd: root, stdio: "inherit" }
  );
  await cp(resolve(root, "dist/types"), resolve(root, "dist/types-cjs"), { recursive: true });
  await writeFile(resolve(root, "dist/types-cjs/package.json"), '{"type":"commonjs"}\n');
}

async function writeThirdPartyLicenses() {
  await mkdir(resolve(root, "dist"), { recursive: true });
  const license = await readFile(
    resolve(root, "node_modules/korean-lunar-calendar/LICENSE"),
    "utf8"
  );
  await writeFile(
    resolve(root, "THIRD-PARTY-LICENSES.txt"),
    `korean-lunar-calendar 0.4.0\nhttps://github.com/usingsky/korean_lunar_calendar_js\n\n${license}`
  );
}

await buildBundles();
await buildTypeDeclarations();
await writeThirdPartyLicenses();
