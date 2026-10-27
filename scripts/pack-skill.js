import { mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillDirectory = resolve(repositoryRoot, "skills/saju8z");
const outputDirectory = resolve(repositoryRoot, "dist/skills");
const archive = resolve(outputDirectory, "saju8z.zip");

await mkdir(outputDirectory, { recursive: true });
await rm(archive, { force: true });
const result = spawnSync("zip", ["-q", "-r", "-X", archive, "."], {
  cwd: skillDirectory,
  stdio: "inherit"
});
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`zip exited with status ${result.status ?? "unknown"}`);
process.stdout.write(`Created ${archive}\n`);
