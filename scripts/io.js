import fs from "node:fs/promises";
import path from "node:path";

export async function writeJSON(outPath, data) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), "utf8");
}

export async function readJSON(inPath, { defaultValue = null } = {}) {
  try {
    const buf = await fs.readFile(inPath, "utf8");
    return JSON.parse(buf);
  } catch (err) {
    if (err && err.code === "ENOENT") return defaultValue;
    throw err;
  }
}

// Backward-compat aliases (different casings used across scripts)
export { writeJSON as writeJson, readJSON as readJson };
