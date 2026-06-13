# SEO Game Starter

A ready-to-deploy SEO-optimized game site template built with Next.js. Based on real experience of hitting **1M UV in 30 days**.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .env.local

# 3. Set up Supabase database
#    - Create a project at supabase.com
#    - Run supabase/schema.sql in SQL Editor
#    - Copy URL and anon key to .env.local

# 4. Start dev server
npm run dev
```

## When You Find a Keyword

1. **Change site content** in `src/messages/en.json` - update title, description, FAQ
2. **Replace the game** in `src/components/game/GameContainer.tsx`
3. **Update domain** in `.env.local` -> `NEXT_PUBLIC_SITE_URL`
4. **Deploy**: `vercel --prod`
5. **Submit for indexing**: `node scripts/submit-index.mjs`

## Features

- **SEO optimized**: sitemap, robots.txt, meta tags, canonical, hreflang
- **Multi-language**: en, de, es, pt, ru (add more with translate script)
- **Leaderboard**: All-time + Daily, with anti-cheat (rate limit, Turnstile)
- **Comment Wall**: Dual-pool (70% high-score, 30% regular), UGC isolated from SEO
- **Share**: Copy link + Twitter/X with UTM tracking
- **Mobile responsive**: Tailwind CSS
- **Analytics**: GA4 with custom game events
- **UGC Isolation**: Leaderboard and comments are client-rendered to prevent keyword pollution

## Key Architecture Decision: UGC Isolation

The #1 SEO mistake from the original article: UGC content (leaderboard timestamps like "2h ago", user comments) polluted the main keyword density, causing the primary keyword to drop from #1 to 0.1% CTR.

**Solution**: All UGC components (Leaderboard.tsx, CommentWall.tsx) are "use client" components. They render on the client side only, so Google's crawler sees clean, keyword-focused HTML.

Verify with: `node scripts/check-keywords.mjs --url http://localhost:3000/en --keyword "your keyword"`

## Scripts

```bash
# Translate to new languages (requires ANTHROPIC_API_KEY)
node scripts/translate.mjs --target ja,ko,fr

# Submit URLs for indexing
node scripts/submit-index.mjs

# Check keyword density (detects UGC pollution)
node scripts/check-keywords.mjs --url http://localhost:3000/en --keyword "your keyword"
```

## Deployment Checklist

- [ ] Domain purchased and configured
- [ ] .env.local filled with production values
- [ ] Supabase database created with schema.sql
- [ ] Favicon ready (don't use placeholder - Google updates slowly!)
- [ ] GA4 configured
- [ ] Google Search Console verified
- [ ] Bing Webmaster Tools verified
- [ ] Sitemap submitted to Google/Bing/Yandex
- [ ] Mobile view tested
- [ ] Turnstile keys configured
- [ ] Meta title/description optimized for CTR

## Tech Stack

- Next.js (App Router, SSR)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- next-intl (i18n)
- Cloudflare Turnstile
- GA4
- Vercel (deploy)

## Project Structure

```
src/
  app/
    [locale]/          # Multi-language pages
      layout.tsx       # SEO meta, GA4, hreflang
      page.tsx         # Main page
      api/             # Leaderboard and comments API
    sitemap.ts         # Dynamic sitemap
    robots.ts          # Robots.txt
  components/
    game/              # Your game (replace this)
    seo/               # FAQ, SEO content (server-rendered)
    social/            # Leaderboard, comments, share (client-rendered)
  lib/                 # Supabase, Turnstile, Analytics
  i18n/                # next-intl config
  messages/            # Language files (en/de/es/pt/ru)
scripts/
  translate.mjs        # AI translation
  submit-index.mjs     # Submit to search engines
  check-keywords.mjs   # Keyword density checker
supabase/
  schema.sql           # Database schema
```
