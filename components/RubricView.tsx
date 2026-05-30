"use client";
import type { EvalReport } from "@/lib/types";

const DIM_LABEL: Record<EvalReport["scores"][number]["dimension"], string> = {
  factual_grounding: "Factual grounding",
  specificity: "Specificity",
  voice_match: "Voice match",
  insight_quality: "Insight quality",
  outbound_discipline: "Outbound discipline",
  anti_sycophancy: "Anti-sycophancy",
};

export function RubricView({
  report,
  error,
}: {
  report: EvalReport | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div
        className="bg-[var(--color-warn-tint)] border border-[var(--color-warn)] px-4 py-3 text-[12.5px] text-[var(--color-warn)]"
        style={{ borderRadius: "var(--radius-md)" }}
      >
        {error}
      </div>
    );
  }
  if (!report) {
    return (
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-[12.5px] text-[var(--color-text-muted)]"
        style={{ borderRadius: "var(--radius-md)" }}
      >
        Awaiting Pass 2 evaluation...
      </div>
    );
  }

  return (
    <section
      className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-5 md:p-6"
      style={{ borderRadius: "var(--radius-md)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold">Pass 2 evaluation</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
            Overall
          </span>
          <span className="display-md text-[22px] text-[var(--color-accent)] tnum">
            {report.overall}
            <span className="text-[12px] text-[var(--color-text-faint)] font-normal">/5</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-5">
        {report.scores.map((s) => (
          <div
            key={s.dimension}
            className="py-2 border-b border-[var(--color-border)] last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-[var(--color-text)]">
                {DIM_LABEL[s.dimension]}
              </span>
              <ScoreBar score={s.score} />
            </div>
            <div className="text-[11.5px] text-[var(--color-text-muted)] mt-1 leading-snug">
              {s.note}
            </div>
          </div>
        ))}
      </div>

      {report.flags.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-2">
            Flagged passages
          </div>
          <ul className="space-y-2">
            {report.flags.map((f, i) => (
              <li
                key={i}
                className="text-[12px] border-l-2 pl-3 py-1"
                style={{
                  borderColor:
                    f.severity === "high"
                      ? "var(--color-warn)"
                      : f.severity === "med"
                      ? "var(--color-accent)"
                      : "var(--color-border-strong)",
                }}
              >
                <div className="text-[var(--color-text)] italic">&ldquo;{f.excerpt}&rdquo;</div>
                <div className="text-[var(--color-text-muted)] mt-1">
                  <span className="uppercase tracking-[0.08em] text-[10.5px] mr-2">
                    {DIM_LABEL[f.dimension]} · {f.severity}
                  </span>
                  {f.why}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="inline-block h-[6px] w-[12px]"
          style={{
            backgroundColor:
              n <= score ? "var(--color-accent)" : "var(--color-border)",
            borderRadius: "1px",
          }}
        />
      ))}
      <span className="tnum text-[11.5px] text-[var(--color-text-muted)] ml-1">{score}</span>
    </div>
  );
}
