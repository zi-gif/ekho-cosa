"use client";
import { useEffect, useState } from "react";
import type { EmailDraft } from "@/lib/types";

const ID_LABEL: Record<EmailDraft["id"], string> = {
  open: "Email 1 · open",
  follow_up: "Email 2 · follow up",
  close: "Email 3 · close",
};

export function EmailCard({
  email,
  storageKey,
}: {
  email: EmailDraft;
  storageKey: string;
}) {
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSubject(email.subject);
    setBody(email.body);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const p = JSON.parse(saved) as { subject?: string; body?: string };
        if (p.subject) setSubject(p.subject);
        if (p.body) setBody(p.body);
      }
    } catch {}
  }, [email, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ subject, body }));
    } catch {}
  }, [subject, body, storageKey]);

  const copy = () => {
    const t = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(t).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <article
      className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)]"
      style={{ borderRadius: "var(--radius-md)" }}
    >
      <header className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
          {ID_LABEL[email.id]}
        </span>
        <div className="flex items-center gap-3 text-[11.5px]">
          <button
            type="button"
            onClick={copy}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            {copied ? "copied" : "copy"}
          </button>
          <a
            href={mailto}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            mailto
          </a>
        </div>
      </header>

      <div className="px-5 py-4">
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
          Subject
        </div>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full text-[14.5px] font-medium bg-transparent outline-none border-b border-transparent focus:border-[var(--color-accent)] py-1"
        />
      </div>

      <div className="px-5 pb-5">
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
          Body
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={Math.max(7, body.split("\n").length + 1)}
          className="w-full text-[13.5px] leading-relaxed bg-transparent outline-none resize-y"
          spellCheck={false}
        />
      </div>
    </article>
  );
}
