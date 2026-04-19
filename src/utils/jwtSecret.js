import ApiError from "./ApiError.js";

/** Resolves JWT signing secret from env. On Vercel, `.env` is not deployed — set JWT_SECRET in the dashboard. */
export function requireJwtSecret() {
  const secret = typeof process.env.JWT_SECRET === "string" ? process.env.JWT_SECRET.trim() : "";
  if (!secret) {
    const vercelHint = process.env.VERCEL
      ? " In Vercel: Project → Settings → Environment Variables → add JWT_SECRET for Production, then Redeploy."
      : "";
    throw new ApiError(500, `JWT_SECRET is not configured.${vercelHint}`, "CONFIG_ERROR");
  }
  return secret;
}
