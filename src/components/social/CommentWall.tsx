"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { supabase, type CommentEntry } from "@/lib/supabase";

/**
 * Comment Wall Component
 * IMPORTANT: CLIENT component - UGC content stays out of server HTML
 * to prevent keyword density pollution.
 *
 * Uses a dual-pool display:
 * - 70% high-score comments (incentivizes good play)
 * - 30% regular comments (keeps everyone engaged)
 */
export default function CommentWall() {
  const t = useTranslations("comments");
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    setLoading(true);
    try {
      // Fetch highlighted (high-score) comments
      const { data: highlighted } = await supabase
        .from("comments")
        .select("*")
        .eq("is_highlighted", true)
        .order("created_at", { ascending: false })
        .limit(7);

      // Fetch regular comments
      const { data: regular } = await supabase
        .from("comments")
        .select("*")
        .eq("is_highlighted", false)
        .order("created_at", { ascending: false })
        .limit(3);

      // Merge with 7:3 ratio
      const merged = [
        ...(highlighted || []),
        ...(regular || []),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setComments(merged);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().slice(0, 50),
          content: content.trim().slice(0, 200),
          score: 0, // Set from game state in real usage
          turnstileToken: "", // Add Turnstile widget in production
        }),
      });

      if (res.ok) {
        setContent("");
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t("title")}</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t("username")}
          maxLength={50}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("placeholder")}
            maxLength={200}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !username.trim() || !content.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("submit")}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">{t("empty")}</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`px-4 py-3 rounded-lg ${
                comment.is_highlighted
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{comment.username}</span>
                {comment.score > 0 && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                    {t("scoreBadge", { score: comment.score })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
