export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24 grid-frame">
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-[12.5px] text-[var(--color-text-muted)]">
        <div>
          <div className="text-[var(--color-text)] font-semibold mb-1">About this artifact</div>
          <p>
            Built as an application artifact for Ekho&apos;s Chief of Staff and Agents
            role. The dealer outbound flow is the JD&apos;s marquee example, shipped.
          </p>
        </div>
        <div>
          <div className="text-[var(--color-text)] font-semibold mb-1">Real vs illustrative</div>
          <p>
            Dealer data (curated snapshots and live scrape) is real and traceable
            to the dealer&apos;s public website. The Ekho-active competitor footprint
            is illustrative and clearly labeled. No proprietary Ekho data is used.
          </p>
        </div>
        <div>
          <div className="text-[var(--color-text)] font-semibold mb-1">Stack</div>
          <p>
            Next.js, Tailwind v4, Claude Sonnet 4.6 in a two-pass configuration (creative
            draft, then read-only JSON eval against a six-dimension rubric). Source-side
            scraping via cheerio. Rate-limited at 10 generations per IP per day.
          </p>
        </div>
      </div>
    </footer>
  );
}
