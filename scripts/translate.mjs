#!/usr/bin/env node

/**
 * AI Translation Script
 * Translates en.json to target languages using Claude API.
 *
 * Usage:
 *   node scripts/translate.mjs --target de,es,pt,ru
 *   node scripts/translate.mjs --target ja  # Add new language
 *
 * Requires: ANTHROPIC_API_KEY in .env.local
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, "../src/messages");
const API_KEY = process.env.ANTHROPIC_API_KEY;

const LANGUAGE_NAMES = {
  de: "German",
  es: "Spanish",
  pt: "Brazilian Portuguese",
  ru: "Russian",
  fr: "French",
  ja: "Japanese",
  ko: "Korean",
  zh: "Simplified Chinese",
  it: "Italian",
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  ar: "Arabic",
};

// Parse args
const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith("--target="));
const targets = targetArg ? targetArg.split("=")[1].split(",") : [];

if (targets.length === 0) {
  console.log("Usage: node scripts/translate.mjs --target de,es,pt,ru");
  console.log("Available languages:", Object.keys(LANGUAGE_NAMES).join(", "));
  process.exit(1);
}

if (!API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY not set in environment");
  console.log("   Set it in .env.local or export it");
  process.exit(1);
}

async function translateWithClaude(sourceJson, targetLang) {
  const langName = LANGUAGE_NAMES[targetLang] || targetLang;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Translate the following JSON file from English to ${langName}.
Rules:
- Keep all JSON keys exactly the same (do not translate keys)
- Translate only the string values
- Keep {placeholder} variables unchanged (e.g. {score}, {url}, {round}, {seconds})
- Use natural, native-sounding ${langName} - not machine translation
- For the game context: this is a color memory game website
- Return ONLY the JSON, no explanation

${JSON.stringify(sourceJson, null, 2)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.content[0].text;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const sourceFile = join(MESSAGES_DIR, "en.json");
  const source = JSON.parse(readFileSync(sourceFile, "utf-8"));

  console.log(`\n🌍 Translating to ${targets.length} language(s)...\n`);

  for (const lang of targets) {
    const langName = LANGUAGE_NAMES[lang] || lang;
    console.log(`  📝 Translating to ${langName} (${lang})...`);

    try {
      const translated = await translateWithClaude(source, lang);
      const outFile = join(MESSAGES_DIR, `${lang}.json`);
      writeFileSync(outFile, JSON.stringify(translated, null, 2) + "\n");
      console.log(`  ✅ ${lang}.json saved`);
    } catch (err) {
      console.error(`  ❌ Failed for ${lang}: ${err.message}`);
    }
  }

  console.log(
    "\n⚠️  Please review translations manually before deploying!\n"
  );
}

main().catch(console.error);
