"use client";

export type StepState = { label: string; done: boolean };

export function ScrapeProgress({ steps, error }: { steps: StepState[]; error?: string | null }) {
  if (!steps.length && !error) return null;
  return (
    <div
      className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-5 rise"
      style={{ borderRadius: "var(--radius-md)" }}
    >
      <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-3">
        Scrape progress
      </div>
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 text-[13.5px]">
            <StepIcon done={s.done} />
            <span className={s.done ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
              {s.label}
            </span>
          </li>
        ))}
      </ul>
      {error && (
        <div className="mt-3 px-3 py-2 text-[12.5px] text-[var(--color-warn)] bg-[var(--color-warn-tint)] rounded">
          {error}
        </div>
      )}
    </div>
  );
}

function StepIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="6.5" stroke="var(--color-accent)" strokeWidth="1" fill="var(--color-accent-tint)" />
        <path
          d="M4 7l2 2 4-4"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="check-draw"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6.5" stroke="var(--color-border-strong)" strokeWidth="1" fill="white" />
      <circle cx="7" cy="7" r="2" fill="var(--color-accent)" className="pulse-dot" />
    </svg>
  );
}
