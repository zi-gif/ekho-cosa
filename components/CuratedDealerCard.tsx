"use client";
import type { DealerSnapshot } from "@/lib/types";

const SEGMENT_LABEL: Record<DealerSnapshot["segments"][number], string> = {
  motorcycle: "Motorcycle",
  powersports: "Powersports",
  "atv-utv": "ATV / UTV",
  rv: "RV",
  "used-cars": "Used cars",
  snowmobile: "Snowmobile",
  marine: "Marine",
};

export function CuratedDealerCard({
  dealer,
  onPick,
}: {
  dealer: DealerSnapshot;
  onPick: () => void;
}) {
  const segmentLabels = dealer.segments.slice(0, 3).map((s) => SEGMENT_LABEL[s]).join(" / ");
  const brands = dealer.brands.slice(0, 4).join(", ");
  const moreBrands = dealer.brands.length - 4;

  return (
    <button
      onClick={onPick}
      className="group text-left bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors p-5 flex flex-col gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rise"
      style={{ borderRadius: "var(--radius-md)" }}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14.5px] font-semibold text-[var(--color-text)] leading-tight">
            {dealer.name}
          </div>
          <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
            {dealer.city}, {dealer.state}
          </div>
        </div>
        <span className="text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-text-faint)] mt-1">
          {segmentLabels}
        </span>
      </div>

      <div className="text-[12.5px] text-[var(--color-text-muted)] line-clamp-2">
        {brands}
        {moreBrands > 0 ? ` + ${moreBrands} more` : ""}
      </div>

      <div className="flex items-center justify-between pt-2 mt-auto border-t border-[var(--color-border)]">
        <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-faint)]">
          est <span className="tnum text-[var(--color-text-muted)]">{dealer.estUnitsPerYear.toLocaleString()}</span> / yr
        </span>
        <span className="text-[12px] text-[var(--color-accent)] font-medium group-hover:underline underline-offset-2 decoration-1">
          Run brief →
        </span>
      </div>
    </button>
  );
}
