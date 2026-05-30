# Dealer Outbound Intelligence Agent

Application artifact for the **Chief of Staff & Agents** role at Ekho.

Paste any U.S. dealer's URL and get a 1-page pre-meeting brief plus a personalized 3-email outbound cadence. The agent scrapes the dealer's brand mix and inventory, matches them against an illustrative Ekho-active competitor footprint, and uses a two-pass Claude call (creative draft + read-only JSON eval against a six-dimension rubric) to produce the output.

The build mirrors the JD's marquee paragraph: *"a dealer's first impression of Ekho comes from an agent that already knows what they sell, what their margins look like, what their nearest Ekho-active competitor is doing, and what to say to land the meeting."*

## Stack

- Next.js 16 app router, TypeScript, Tailwind v4 (CSS `@theme` tokens), Bun
- Claude Sonnet 4.6 (`@anthropic-ai/sdk`), server-side only, two-pass with streaming
- Cheerio for live dealer scrape (server-side, with SSE progress)
- Upstash rate limit (10/IP/day) with in-memory fallback
- 6 curated dealer snapshots + 16-entry illustrative Ekho competitor footprint
- Persistent scenario banner discloses real-vs-illustrative on every page

## Local dev

```bash
bun install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
bun run dev
```

Open http://localhost:3000.

## Deploy

Push to `main` on GitHub; Vercel auto-builds. After the first deploy, set in Vercel project settings:

- `ANTHROPIC_API_KEY` (required)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (optional, set via Vercel's Upstash marketplace integration)

## Out of scope (deliberate)

LinkedIn DMs, call openers, SMS, CRM push, multi-touch attribution, auth, server-side history, live chat agent, real Ekho dealer-network data. Each is a sensible next step; none are built here. Depth over width.

## Real vs illustrative

- **Real**: curated dealer snapshots and live-scrape output (traceable to each dealer's public website), industry economics priors, Ekho voice samples drawn from public Ekho marketing and Rowan's essays.
- **Illustrative**: the Ekho-active competitor footprint (16 fabricated stores across U.S. regions). No proprietary Ekho data is used. The persistent scenario banner discloses this on every page.

Byline: Zi.
