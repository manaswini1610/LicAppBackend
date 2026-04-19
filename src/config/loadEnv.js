import dotenv from "dotenv";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..", "..");
const rootEnv = join(projectRoot, ".env");
const cwdEnv = join(process.cwd(), ".env");

// cwd first, then repo root — when both exist, project .env wins (override: true).
// override: true — empty JWT_SECRET from the parent process must not block .env values.
const paths = [...new Set([cwdEnv, rootEnv])].filter((p) => existsSync(p));
for (const p of paths) {
  dotenv.config({ path: p, override: true });
}
