import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
}

// Types for our database tables
export interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  created_at: string;
  ip_hash: string;
}

export interface CommentEntry {
  id: number;
  username: string;
  content: string;
  score: number;
  is_highlighted: boolean;
  created_at: string;
  ip_hash: string;
}
