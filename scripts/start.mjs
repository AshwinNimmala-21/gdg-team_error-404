// `npm start`: run the standalone server like Cloud Run does. Local .env / .env.local values fill in
// only variables that aren't already set, matching Next.js precedence (real environment wins).
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const [k, v] of Object.entries(parseEnv(readFileSync(file, "utf8")))) if (process.env[k] === undefined) process.env[k] = v;
}
await import("../.next/standalone/server.js");
