import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma config files don't auto-load .env, so load it ourselves (simple
// KEY="value" parsing — no extra dependency). Existing env vars win.
try {
  const envPath = path.join(process.cwd(), ".env");
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch {
  /* no .env file — fine in CI/prod where vars are set directly */
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
