export function ScenarioBanner() {
  return (
    <div
      className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      role="note"
      aria-label="scenario disclosure"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-2 flex items-center gap-3 text-[11.5px] tracking-[0.04em] uppercase text-[var(--color-text-muted)]">
        <span className="inline-flex h-[6px] w-[6px] rounded-full bg-[var(--color-accent)] pulse-dot" />
        <span className="hidden sm:inline">Scenario</span>
        <span className="font-medium text-[var(--color-text)] normal-case tracking-normal text-[12.5px]">
          Dealer data is real (curated snapshots or live scrape). Ekho competitor footprint is illustrative for demo.
        </span>
      </div>
    </div>
  );
}
