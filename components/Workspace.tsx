"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Brief, DealerSnapshot, EkhoCompetitor, EvalReport } from "@/lib/types";
import { CuratedDealerCard } from "./CuratedDealerCard";
import { URLInput } from "./URLInput";
import { ScrapeProgress, type StepState } from "./ScrapeProgress";
import { DealerProfile } from "./DealerProfile";
import { Markdown } from "./Markdown";
import { EmailCard } from "./EmailCard";
import { RubricView } from "./RubricView";
import { parsePass1 } from "@/lib/parse-pass1";

type Phase = "idle" | "scraping" | "scraped" | "generating" | "done" | "error";

export function Workspace({ curated }: { curated: DealerSnapshot[] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [dealer, setDealer] = useState<DealerSnapshot | null>(null);
  const [scrapeSteps, setScrapeSteps] = useState<StepState[]>([]);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [competitor, setCompetitor] = useState<EkhoCompetitor | null>(null);
  const [pass1, setPass1] = useState<string>("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [evalReport, setEvalReport] = useState<EvalReport | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setDealer(null);
    setScrapeSteps([]);
    setScrapeError(null);
    setCompetitor(null);
    setPass1("");
    setBrief(null);
    setEvalReport(null);
    setEvalError(null);
    setError(null);
  }, []);

  const runGenerate = useCallback(async (target: DealerSnapshot) => {
    setPhase("generating");
    setPass1("");
    setBrief(null);
    setEvalReport(null);
    setEvalError(null);
    setCompetitor(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dealer: target }),
      });
      if (!res.body) throw new Error("no stream");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `generate failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          let ev: { kind: string; [k: string]: unknown };
          try {
            ev = JSON.parse(json);
          } catch {
            continue;
          }
          if (ev.kind === "competitor") {
            setCompetitor(ev.data as EkhoCompetitor);
          } else if (ev.kind === "chunk") {
            acc += String(ev.text ?? "");
            setPass1(acc);
          } else if (ev.kind === "pass1_done") {
            setBrief(parsePass1(String(ev.text ?? acc)));
          } else if (ev.kind === "eval") {
            setEvalReport(ev.data as EvalReport);
          } else if (ev.kind === "eval_error") {
            setEvalError(String(ev.message ?? "Evaluation parse failed."));
          } else if (ev.kind === "error") {
            setError(String(ev.message ?? "generation failed"));
            setPhase("error");
            return;
          }
        }
      }

      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "generation failed");
      setPhase("error");
    }
  }, []);

  const pickCurated = useCallback(
    (d: DealerSnapshot) => {
      setDealer(d);
      setScrapeError(null);
      setScrapeSteps([{ label: "Loading curated snapshot", done: true }]);
      setPhase("scraped");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      runGenerate(d);
    },
    [runGenerate]
  );

  const pickLive = useCallback(
    async (url: string) => {
      reset();
      setPhase("scraping");
      setScrapeSteps([]);
      setScrapeError(null);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `scrape failed (${res.status})`);
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const json = line.slice(5).trim();
            if (!json) continue;
            let ev: { kind: string; [k: string]: unknown };
            try {
              ev = JSON.parse(json);
            } catch {
              continue;
            }
            if (ev.kind === "step") {
              const label = String(ev.label);
              const done = Boolean(ev.done);
              setScrapeSteps((prev) => {
                const idx = prev.findIndex((s) => s.label === label);
                if (idx >= 0) {
                  const copy = prev.slice();
                  copy[idx] = { label, done };
                  return copy;
                }
                return [...prev, { label, done }];
              });
            } else if (ev.kind === "snapshot") {
              const d = ev.data as DealerSnapshot;
              setDealer(d);
              setPhase("scraped");
              runGenerate(d);
            } else if (ev.kind === "error") {
              setScrapeError(String(ev.message ?? "scrape failed"));
              setPhase("idle");
            }
          }
        }
      } catch (e) {
        setScrapeError(e instanceof Error ? e.message : "scrape failed");
        setPhase("idle");
      }
    },
    [reset, runGenerate]
  );

  return (
    <div className="grid-frame">
      {/* Hero */}
      <section className="grain hero-gradient">
        <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-16 md:py-24">
          <div className="max-w-[840px]">
            <h1 className="display text-[44px] md:text-[64px] text-[#0a1734]">
              Dealer outbound that already knows the dealer.
            </h1>
            <p className="mt-5 text-[16.5px] md:text-[18px] leading-[1.45] text-[#0a1734] opacity-80 max-w-[640px]">
              Paste a U.S. dealer URL. The agent scrapes their brand mix and inventory,
              matches them against the Ekho-active footprint, and returns a 1-page brief
              plus a 3-email cadence ready to send. Two-pass Claude: creative draft, then
              read-only eval against a six-dimension rubric.
            </p>
          </div>
        </div>
      </section>

      {/* Picker */}
      <section className="bg-[var(--color-bg)] border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-2">
              Curated dealers (instant)
            </div>
            <h2 className="text-[16px] font-semibold mb-1">
              Six real U.S. dealers, pre-scraped.
            </h2>
            <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
              Click any one to skip the live scrape and go straight to the brief.
              Snapshots were captured from each dealer&apos;s public site; inventory
              numbers and brand mix are real at the time of capture.
            </p>
            <div className="mt-6">
              <URLInput onSubmit={pickLive} disabled={phase === "scraping" || phase === "generating"} />
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {curated.map((d) => (
              <CuratedDealerCard key={d.id} dealer={d} onPick={() => pickCurated(d)} />
            ))}
          </div>
        </div>
      </section>

      {/* Result */}
      <div ref={resultRef} />
      {(phase !== "idle" || scrapeError) && (
        <section className="bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
                  Workspace
                </div>
                <h2 className="display-md text-[24px]">
                  {phase === "scraping" && "Reading dealer site"}
                  {phase === "scraped" && "Snapshot resolved"}
                  {phase === "generating" && "Generating outbound"}
                  {phase === "done" && "Brief ready"}
                  {phase === "error" && "Something went wrong"}
                </h2>
              </div>
              {dealer && (
                <button
                  onClick={reset}
                  className="text-[12.5px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  ← start over
                </button>
              )}
            </div>

            {phase === "scraping" && (
              <ScrapeProgress steps={scrapeSteps} error={scrapeError} />
            )}
            {scrapeError && phase === "idle" && (
              <ScrapeProgress steps={scrapeSteps} error={scrapeError} />
            )}

            {phase === "error" && error && (
              <div
                className="bg-[var(--color-warn-tint)] border border-[var(--color-warn)] px-5 py-4"
                style={{ borderRadius: "var(--radius-md)" }}
              >
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-warn)] mb-1.5">
                  Generation failed
                </div>
                <p className="text-[13.5px] text-[var(--color-text)] leading-relaxed">
                  {error}
                </p>
                {/ANTHROPIC_API_KEY/i.test(error) && (
                  <p className="text-[12.5px] text-[var(--color-text-muted)] mt-2">
                    Locally: <code className="px-1 py-0.5 rounded bg-[var(--color-surface)]">cp .env.example .env.local</code>, paste your key, then restart <code className="px-1 py-0.5 rounded bg-[var(--color-surface)]">bun run dev</code>. On Vercel: add it in project settings.
                  </p>
                )}
              </div>
            )}

            {dealer && <DealerProfile dealer={dealer} competitor={competitor} />}

            {(phase === "generating" || phase === "done" || phase === "error") && (
              <section
                className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-6 md:p-8"
                style={{ borderRadius: "var(--radius-md)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold">Pre-meeting brief</h3>
                  {phase === "generating" && (
                    <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
                      <span className="inline-flex h-[6px] w-[6px] rounded-full bg-[var(--color-accent)] pulse-dot" />
                      streaming
                    </span>
                  )}
                </div>
                {pass1 ? (
                  <Markdown source={brief ? brief.briefMarkdown : pass1.split(/---EMAILS---/)[0]} />
                ) : (
                  <div className="text-[13px] text-[var(--color-text-muted)]">
                    Loading model context, voice samples, and economic priors...
                  </div>
                )}
                {error && phase === "error" && (
                  <div className="mt-4 px-4 py-3 bg-[var(--color-warn-tint)] border border-[var(--color-warn)] text-[var(--color-warn)] text-[12.5px]"
                       style={{ borderRadius: "var(--radius-sm)" }}>
                    {error}
                  </div>
                )}
              </section>
            )}

            {brief && (
              <section className="space-y-3">
                <h3 className="text-[14px] font-semibold">Outbound cadence</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {brief.emails.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      storageKey={`ekho-cosa:email:${dealer?.id}:${email.id}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {(brief || evalReport || evalError) && (
              <RubricView report={evalReport} error={evalError} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
