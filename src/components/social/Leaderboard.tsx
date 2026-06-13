"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { supabase, type LeaderboardEntry } from "@/lib/supabase";

/**
 * Leaderboard Component
 * IMPORTANT: This is a CLIENT component. UGC content is rendered on the client
 * to prevent keyword pollution in the server-rendered HTML.
 */
export default function Leaderboard() {
  const t = useTranslations("leaderboard");
  const [tab, setTab] = useState<"alltime" | "daily">("alltime");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab]);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      let query = supabase
        .from("leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(100);

      if (tab === "daily") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte("created_at", today.toISOString());
      }

      const { data } = await query;
      setEntries(data || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t("title")}</h2>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("alltime")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "alltime"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {t("allTime")}
        </button>
        <button
          onClick={() => setTab("daily")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "daily"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {t("daily")}
        </button>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-gray-400">{t("empty")}</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {entries.slice(0, 10).map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                i < 3
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold w-8 text-center ${
                    i === 0
                      ? "text-yellow-500 text-lg"
                      : i === 1
                      ? "text-gray-400 text-lg"
                      : i === 2
                      ? "text-amber-600 text-lg"
                      : "text-gray-500"
                  }`}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <span className="font-medium truncate max-w-[120px]">
                  {entry.username}
                </span>
              </div>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {entry.score}
              </span>
            </div>
          ))}
          {entries.length > 10 && (
            <details className="mt-2">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 text-center">
                Show more ({entries.length - 10} more)
              </summary>
              <div className="space-y-2 mt-2">
                {entries.slice(10).map((entry, i) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold w-8 text-center text-gray-500">
                        {i + 11}
                      </span>
                      <span className="font-medium truncate max-w-[120px]">
                        {entry.username}
                      </span>
                    </div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
