import { env as processEnv } from "node:process";
import ApiError from "./ApiError.js";

/**
 * Read JWT secret at runtime. Vercel's bundler can inline `process.env.JWT_SECRET` at build
 * time (when unset), producing a constant undefined — use dynamic `env[key]` instead.
 */
function resolveJwtSecret() {
  const keys = ["JWT_SECRET", "JWT_SIGNING_SECRET"];
  for (const key of keys) {
    const v = processEnv[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return "";
}

/** Resolves JWT signing secret from env. On Vercel, set JWT_SECRET in Project → Environment Variables. */
export function requireJwtSecret() {
  const secret = resolveJwtSecret();
  if (!secret) {
    const vercelHint = processEnv.VERCEL
      ? " In Vercel: Settings → Environment Variables → add JWT_SECRET for Production, then Redeploy."
      : "";
    throw new ApiError(500, `JWT_SECRET is not configured.${vercelHint}`, "CONFIG_ERROR");
  }
  return secret;
}
