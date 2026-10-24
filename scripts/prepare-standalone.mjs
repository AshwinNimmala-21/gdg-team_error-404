// After `next build` with output: "standalone": copy the static assets next to server.js,
// so `npm start` (and the Docker image) serve exactly what Cloud Run will serve.
import { cpSync, existsSync } from "node:fs";

if (existsSync(".next/standalone")) {
  cpSync("public", ".next/standalone/public", { recursive: true });
  cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
  console.log("standalone: copied public/ and .next/static/");
}
