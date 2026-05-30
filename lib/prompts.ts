import type { DealerSnapshot, EkhoCompetitor } from "@/lib/types";
import { promises as fs } from "node:fs";
import path from "node:path";

let voiceCache: string | null = null;
let rubricCache: string | null = null;
let priorsCache: string | null = null;

async function loadVoice(): Promise<string> {
  if (voiceCache) return voiceCache;
  voiceCache = await fs.readFile(path.join(process.cwd(), "data", "ekho-voice-samples.md"), "utf-8");
  return voiceCache;
}
async function loadRubric(): Promise<string> {
  if (rubricCache) return rubricCache;
  rubricCache = await fs.readFile(path.join(process.cwd(), "data", "outbound-rubric.md"), "utf-8");
  return rubricCache;
}
async function loadPriors(): Promise<string> {
  if (priorsCache) return priorsCache;
  priorsCache = await fs.readFile(path.join(process.cwd(), "data", "dealer-economics-priors.md"), "utf-8");
  return priorsCache;
}

export async function buildPass1Prompt(
  dealer: DealerSnapshot,
  competitor: EkhoCompetitor
): Promise<{ system: string; user: string }> {
  const [voice, priors] = await Promise.all([loadVoice(), loadPriors()]);

  const system = `You are a Chief of Staff at Ekho, the vehicle commerce platform. You write outbound for Ekho's BD team to dealer principals. You are operator-to-operator, never marketer-to-customer. You never use em dashes (use commas, semicolons, periods, or parentheses).

VOICE CALIBRATION:
${voice}

INDUSTRY PRIORS (use to estimate, never present inferred numbers as known):
${priors}

OUTPUT FORMAT:
Return two sections in this exact order, separated by the literal token \`---EMAILS---\` on its own line.

SECTION 1: a 1-page pre-meeting brief in markdown. Sections, in order:
## Read
One paragraph: what this dealer is, in your own words.
## Inventory signal
3-5 bullets on brand mix, volume tier, inventory shape, gaps.
## Economic angle
2-3 bullets on margin pressure, days-on-lot risk, F&I opportunity, or cross-state titling exposure. Use priors honestly; name inferences as inferences.
## Their nearest Ekho-active competitor
One paragraph naming the matched dealer and what they use Ekho for.
## What to lead with
One sentence: the opening observation for email 1.

SECTION 2: three emails separated by the literal token \`---EMAIL---\` on its own line between them.

Each email format:
SUBJECT: <subject line, no emojis, no exclamation marks>
<blank line>
<email body, 80-140 words, signed "Zi // Ekho">

Email 1: open. Lead with the specific observation from "What to lead with."
Email 2: follow up 4 days later. Different angle. Reference Ekho competitor.
Email 3: close. Single ask. No "or whatever works for you."

Do not include any preamble or postscript outside the two sections.`;

  const user = `TARGET DEALER:
Name: ${dealer.name}
URL: ${dealer.url}
Location: ${dealer.city}, ${dealer.state} (${dealer.region})
Segments: ${dealer.segments.join(", ")}
Brands: ${dealer.brands.join(", ")}
Estimated volume: ${dealer.estUnitsPerYear} units/year
Estimated avg gross per unit: $${dealer.estAvgGrossPerUnit}
Inventory sample:
${dealer.inventorySample.map((i) => `- ${i.year} ${i.label} (${i.condition}, $${i.price.toLocaleString()})`).join("\n")}
Signals:
${dealer.signals.map((s) => `- ${s}`).join("\n")}
About copy from their site:
"${dealer.aboutCopy}"

MATCHED EKHO-ACTIVE COMPETITOR (illustrative, used for outbound talking point):
${competitor.name} (${competitor.city}, ${competitor.state})
Segment: ${competitor.segment}
Ekho products: ${competitor.ekhoProducts.join(", ")}
One-liner: ${competitor.oneLiner}

Generate the brief and the 3-email cadence.`;

  return { system, user };
}

export async function buildPass2Prompt(
  dealer: DealerSnapshot,
  competitor: EkhoCompetitor,
  pass1Output: string
): Promise<{ system: string; user: string }> {
  const rubric = await loadRubric();
  const system = `You are an evaluation judge for Ekho's outbound. Score the provided brief-and-emails against the rubric. Return JSON only. No prose, no code fences, no preamble.

${rubric}`;

  const user = `SOURCE CONTEXT (what was available to ground the output):
Dealer: ${dealer.name}, ${dealer.city} ${dealer.state}
Brands: ${dealer.brands.join(", ")}
Volume: ${dealer.estUnitsPerYear} units/year
Sample inventory items: ${dealer.inventorySample.length}
Matched competitor: ${competitor.name} using ${competitor.ekhoProducts.join(", ")}

OUTPUT TO EVALUATE:
${pass1Output}

Return the JSON only.`;
  return { system, user };
}
