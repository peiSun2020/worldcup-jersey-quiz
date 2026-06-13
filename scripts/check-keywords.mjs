#!/usr/bin/env node

/**
 * Keyword Density Checker
 * Checks if UGC content is polluting your main keywords in server-rendered HTML.
 *
 * Usage:
 *   node scripts/check-keywords.mjs --url http://localhost:3000/en --keyword "color memory"
 */

const args = process.argv.slice(2);
const urlArg = args.find((a) => a.startsWith("--url="));
const keywordArg = args.find((a) => a.startsWith("--keyword="));

const url = urlArg?.split("=")[1] || "http://localhost:3000/en";
const mainKeyword = keywordArg?.split("=")[1] || "color memory game";

async function main() {
  console.log(`\n🔍 Checking keyword density for: "${mainKeyword}"`);
  console.log(`   URL: ${url}\n`);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SEO-Keyword-Checker/1.0" },
    });
    const html = await res.text();

    // Strip HTML tags
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();

    const words = text.split(/\s+/).filter((w) => w.length > 2);
    const totalWords = words.length;

    // Count keyword occurrences
    const keywordLower = mainKeyword.toLowerCase();
    const keywordCount = (
      text.match(new RegExp(keywordLower, "g")) || []
    ).length;
    const keywordDensity = ((keywordCount / totalWords) * 100).toFixed(2);

    // Find top 20 words
    const wordFreq = {};
    for (const word of words) {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    const sorted = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    console.log(`📊 Results:`);
    console.log(`   Total words: ${totalWords}`);
    console.log(
      `   "${mainKeyword}" appears: ${keywordCount} times (${keywordDensity}%)`
    );
    console.log(`\n   Recommended density: 1-3%`);

    if (parseFloat(keywordDensity) < 0.5) {
      console.log(`   ⚠️  WARNING: Keyword density too low!`);
      console.log(`   Your main keyword might be diluted by UGC content.`);
    } else if (parseFloat(keywordDensity) > 4) {
      console.log(`   ⚠️  WARNING: Keyword density too high!`);
      console.log(`   This might be flagged as keyword stuffing.`);
    } else {
      console.log(`   ✅ Keyword density looks good.`);
    }

    console.log(`\n📋 Top 20 words in page:`);
    for (const [word, count] of sorted) {
      const density = ((count / totalWords) * 100).toFixed(2);
      const marker = word === "ago" ? " ⚠️  UGC?" : "";
      console.log(`   ${count.toString().padStart(4)} (${density}%) - ${word}${marker}`);
    }

    // Check for common UGC pollution signals
    const ugcSignals = ["ago", "posted", "replied", "commented"];
    const polluted = ugcSignals.filter(
      (w) => wordFreq[w] && wordFreq[w] > 5
    );

    if (polluted.length > 0) {
      console.log(`\n⚠️  Possible UGC pollution detected!`);
      console.log(
        `   High-frequency UGC words: ${polluted.join(", ")}`
      );
      console.log(
        `   Consider isolating UGC to client-side rendering.`
      );
    } else {
      console.log(`\n✅ No UGC pollution detected in server HTML.`);
    }
  } catch (err) {
    console.error(`❌ Failed to fetch: ${err.message}`);
    console.log(`   Make sure the dev server is running: npm run dev`);
  }

  console.log("");
}

main();
