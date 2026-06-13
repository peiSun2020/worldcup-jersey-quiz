"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GameEvents } from "@/lib/analytics";

export default function ShareButton() {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  async function copyLink() {
    try {
      const url = new URL(shareUrl);
      url.searchParams.set("utm_source", "share");
      url.searchParams.set("utm_medium", "copy");
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      GameEvents.shareClick("copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }

  function shareTwitter() {
    const url = new URL(shareUrl);
    url.searchParams.set("utm_source", "twitter");
    url.searchParams.set("utm_medium", "social");
    const text = t("shareText", { score: "??", url: url.toString() });
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
    GameEvents.shareClick("twitter");
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        {copied ? t("copied") : t("copy")}
      </button>
      <button
        onClick={shareTwitter}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {t("twitter")}
      </button>
    </div>
  );
}
