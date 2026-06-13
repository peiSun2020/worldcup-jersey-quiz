/**
 * Cloudflare Turnstile verification
 * Used to prevent bot submissions on leaderboard and comments
 */

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || "";

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    // Skip verification in development
    if (process.env.NODE_ENV === "development") return true;
    console.warn("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
        }),
      }
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
