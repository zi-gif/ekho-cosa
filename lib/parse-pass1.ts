import type { Brief, EmailDraft } from "@/lib/types";

const EMAIL_IDS: EmailDraft["id"][] = ["open", "follow_up", "close"];

export function parsePass1(raw: string): Brief {
  const [briefPart, emailsPart = ""] = raw.split(/^---EMAILS---\s*$/m);
  const briefMarkdown = briefPart.trim();
  const emailBlocks = emailsPart.split(/^---EMAIL---\s*$/m).map((s) => s.trim()).filter(Boolean);

  const emails: EmailDraft[] = emailBlocks.slice(0, 3).map((block, i) => {
    const subjectMatch = block.match(/^SUBJECT:\s*(.+)$/m);
    const subject = subjectMatch ? subjectMatch[1].trim() : "(no subject)";
    const body = block.replace(/^SUBJECT:.+\n+/m, "").trim();
    return { id: EMAIL_IDS[i] ?? "open", subject, body };
  });

  while (emails.length < 3) {
    emails.push({ id: EMAIL_IDS[emails.length], subject: "(no subject)", body: "" });
  }

  return { briefMarkdown, emails };
}
