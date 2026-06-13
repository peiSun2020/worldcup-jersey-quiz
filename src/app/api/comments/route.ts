import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";

// Blocked words list - add more as needed
const BLOCKED_WORDS = ["spam", "http://", "https://", "<script"];

// GET /api/comments
export async function GET() {
  // Fetch highlighted (high-score) comments - 70%
  const { data: highlighted } = await supabase
    .from("comments")
    .select("id, username, content, score, is_highlighted, created_at")
    .eq("is_highlighted", true)
    .order("created_at", { ascending: false })
    .limit(7);

  // Fetch regular comments - 30%
  const { data: regular } = await supabase
    .from("comments")
    .select("id, username, content, score, is_highlighted, created_at")
    .eq("is_highlighted", false)
    .order("created_at", { ascending: false })
    .limit(3);

  const merged = [...(highlighted || []), ...(regular || [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json(merged);
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, content, score, turnstileToken } = body;

    // Validate
    if (!username || typeof username !== "string" || username.length > 50) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.length > 200) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    // Check for blocked words
    const lower = content.toLowerCase();
    if (BLOCKED_WORDS.some((word) => lower.includes(word))) {
      return NextResponse.json(
        { error: "Content not allowed" },
        { status: 400 }
      );
    }

    // Verify Turnstile
    if (process.env.NODE_ENV !== "development") {
      const valid = await verifyTurnstile(turnstileToken || "");
      if (!valid) {
        return NextResponse.json(
          { error: "Verification failed" },
          { status: 403 }
        );
      }
    }

    // Get IP hash
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = await hashIP(ip);

    // Rate limit: max 5 comments per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo);

    if (count && count >= 5) {
      return NextResponse.json(
        { error: "Too many comments" },
        { status: 429 }
      );
    }

    // Determine if highlighted (high score threshold)
    const HIGHLIGHT_THRESHOLD = 50; // Adjust based on your game
    const isHighlighted =
      typeof score === "number" && score >= HIGHLIGHT_THRESHOLD;

    const { error } = await supabase.from("comments").insert({
      username: username.trim().slice(0, 50),
      content: content.trim().slice(0, 200),
      score: typeof score === "number" ? score : 0,
      is_highlighted: isHighlighted,
      ip_hash: ipHash,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to post" }, { status: 500 });
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
