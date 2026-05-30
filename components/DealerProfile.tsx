"use client";
import type { DealerSnapshot, EkhoCompetitor } from "@/lib/types";

export function DealerProfile({
  dealer,
  competitor,
}: {
  dealer: DealerSnapshot;
  competitor: EkhoCompetitor | null;
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-5 gap-px bg-[var(--color-border)] border border-[var(--color-border)]"
      style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      {/* Dealer card */}
      <div className="md:col-span-3 bg-[var(--color-surface-elevated)] p-5 md:p-7">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
              Target dealer
            </div>
            <h2 className="display-md text-[22px] md:text-[26px] mt-1">{dealer.name}</h2>
            <a
              href={dealer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] text-[var(--color-accent)] hover:underline underline-offset-2"
            >
              {dealer.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          </div>
          <span
            className="text-[10.5px] uppercase tracking-[0.12em] px-2 py-1 border border-[var(--color-border-strong)] text-[var(--color-text-muted)]"
            style={{ borderRadius: "var(--radius-pill)" }}
          >
            {dealer.source === "live" ? "live scrape" : "curated"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 mt-4">
          <Row label="Location" value={`${dealer.city}, ${dealer.state}`} />
          <Row label="Region" value={dealer.region} />
          <Row label="Segments" value={dealer.segments.join(", ")} />
          <Row label="Brands" value={`${dealer.brands.length}`} />
          <Row
            label="Est volume"
            value={`${dealer.estUnitsPerYear.toLocaleString()} /yr`}
          />
          <Row
            label="Est avg gross"
            value={`$${dealer.estAvgGrossPerUnit.toLocaleString()} /unit`}
          />
        </div>

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-2">
            Brand mix
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dealer.brands.map((b) => (
              <span
                key={b}
                className="text-[11.5px] px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]"
                style={{ borderRadius: "var(--radius-xs)" }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {dealer.inventorySample.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-2">
              Inventory sample
            </div>
            <div className="border-t border-[var(--color-border)]">
              {dealer.inventorySample.slice(0, 6).map((i, idx) => (
                <div key={idx} className="row-hairline">
                  <div>
                    <span className="text-[var(--color-text)]">
                      {i.year} {i.label}
                    </span>
                    <span className="ml-2 text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
                      {i.condition}
                    </span>
                  </div>
                  <div className="tnum">${i.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ekho competitor card */}
      <div className="md:col-span-2 bg-[var(--color-surface)] p-5 md:p-7 relative">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
          Nearest Ekho-active competitor
        </div>
        <span className="absolute top-5 right-5 text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-warn)] bg-[var(--color-warn-tint)] px-2 py-0.5"
              style={{ borderRadius: "var(--radius-xs)" }}>
          illustrative
        </span>

        {competitor ? (
          <>
            <h3 className="display-md text-[19px] mt-1">{competitor.name}</h3>
            <div className="text-[12.5px] text-[var(--color-text-muted)] mb-4">
              {competitor.city}, {competitor.state} · {competitor.segment}
            </div>

            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
              Ekho products
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {competitor.ekhoProducts.map((p) => (
                <span
                  key={p}
                  className="text-[11.5px] px-2 py-1 bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-medium"
                  style={{ borderRadius: "var(--radius-xs)" }}
                >
                  {p}
                </span>
              ))}
            </div>

            <blockquote className="text-[13.5px] text-[var(--color-text)] border-l-2 border-[var(--color-accent)] pl-3 italic">
              {competitor.oneLiner}
            </blockquote>
          </>
        ) : (
          <div className="text-[13px] text-[var(--color-text-muted)] mt-2">
            Generating match...
          </div>
        )}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5 border-b border-[var(--color-border)] flex items-center justify-between gap-3">
      <span className="text-[11.5px] uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
        {label}
      </span>
      <span className="text-[13.5px] text-[var(--color-text)] tnum text-right">{value}</span>
    </div>
  );
}
