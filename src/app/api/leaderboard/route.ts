import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";

// GET /api/leaderboard?type=alltime|daily
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "alltime";

  let query = supabase
    .from("leaderboard")
    .select("id, username, score, created_at")
    .order("score", { ascending: false })
    .limit(100);

  if (type === "daily") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.gte("created_at", today.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/leaderboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, score, turnstileToken } = body;

    // Validate input
    if (!username || typeof username !== "string" || username.length > 50) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    if (typeof score !== "number" || score < 0 || score > 10000) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    // Verify Turnstile (skip in development)
    if (process.env.NODE_ENV !== "development") {
      const valid = await verifyTurnstile(turnstileToken || "");
      if (!valid) {
        return NextResponse.json(
          { error: "Verification failed" },
          { status: 403 }
        );
      }
    }

    // Get IP hash for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = await hashIP(ip);

    // Rate limit: max 10 submissions per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("leaderboard")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo);

    if (count && count >= 10) {
      return NextResponse.json(
        { error: "Too many submissions" },
        { status: 429 }
      );
    }

    // Insert
    const { error } = await supabase.from("leaderboard").insert({
      username: username.trim().slice(0, 50),
      score,
      ip_hash: ipHash,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_HASH_SALT || "seo-game"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
