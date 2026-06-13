#!/usr/bin/env node

/**
 * Submit URLs to Google Indexing API and Bing IndexNow
 *
 * Usage:
 *   node scripts/submit-index.mjs
 *   node scripts/submit-index.mjs --url https://yourdomain.com/en
 */

import { readFileSync } from "fs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
const LOCALES = ["en", "de", "es", "pt", "ru"];
const BING_KEY = process.env.BING_INDEXNOW_KEY || "";

// Parse CLI args
const args = process.argv.slice(2);
const urlArg = args.find((a) => a.startsWith("--url="));
const specificUrl = urlArg ? urlArg.split("=")[1] : null;

// URLs to submit
const urls = specificUrl
  ? [specificUrl]
  : LOCALES.map((l) => `${SITE_URL}/${l}`);

async function submitBingIndexNow(urls) {
  if (!BING_KEY) {
    console.log("⚠️  BING_INDEXNOW_KEY not set, skipping Bing submission");
    return;
  }

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: BING_KEY,
        urlList: urls,
      }),
    });

    if (res.ok || res.status === 202) {
      console.log(`✅ Bing IndexNow: ${urls.length} URLs submitted`);
    } else {
      console.log(`❌ Bing IndexNow failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error("❌ Bing IndexNow error:", err.message);
  }
}

async function submitGoogleIndexing(urls) {
  const keyFile = process.env.GOOGLE_INDEXING_KEY_FILE;
  if (!keyFile) {
    console.log(
      "⚠️  GOOGLE_INDEXING_KEY_FILE not set, skipping Google submission"
    );
    console.log(
      "   To enable: set up Google Indexing API and download service account key"
    );
    console.log(
      "   Guide: https://developers.google.com/search/apis/indexing-api/v3/prereqs"
    );
    return;
  }

  console.log(
    "ℹ️  Google Indexing API requires OAuth2. For quick submission:"
  );
  console.log("   1. Go to Google Search Console");
  console.log("   2. URL Inspection > Submit each URL manually");
  console.log("   Or set up the API: https://developers.google.com/search/apis/indexing-api/v3/quickstart");

  for (const url of urls) {
    console.log(`   📋 ${url}`);
  }
}

async function main() {
  console.log(`\n🔍 Submitting ${urls.length} URL(s) for indexing...\n`);

  for (const url of urls) {
    console.log(`  • ${url}`);
  }
  console.log("");

  await Promise.all([submitBingIndexNow(urls), submitGoogleIndexing(urls)]);

  console.log("\n✅ Done! Also submit your sitemap:");
  console.log(`   Google: https://search.google.com/search-console`);
  console.log(`   Bing: https://www.bing.com/webmasters`);
  console.log(`   Yandex: https://webmaster.yandex.com`);
  console.log(`\n   Sitemap URL: ${SITE_URL}/sitemap.xml\n`);
}

main().catch(console.error);
