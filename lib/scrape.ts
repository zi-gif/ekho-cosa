import * as cheerio from "cheerio";
import type { DealerSnapshot } from "@/lib/types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const REGION_BY_STATE: Record<string, DealerSnapshot["region"]> = {
  AL: "Southeast", AR: "Southeast", FL: "Southeast", GA: "Southeast", KY: "Southeast",
  LA: "Southeast", MS: "Southeast", NC: "Southeast", SC: "Southeast", TN: "Southeast",
  VA: "Southeast", WV: "Southeast",
  CT: "Northeast", DE: "Northeast", ME: "Northeast", MD: "Northeast", MA: "Northeast",
  NH: "Northeast", NJ: "Northeast", NY: "Northeast", PA: "Northeast", RI: "Northeast",
  VT: "Northeast",
  IL: "Midwest", IN: "Midwest", IA: "Midwest", KS: "Midwest", MI: "Midwest", MN: "Midwest",
  MO: "Midwest", NE: "Midwest", ND: "Midwest", OH: "Midwest", SD: "Midwest", WI: "Midwest",
  AZ: "Southwest", NM: "Southwest", OK: "Southwest", TX: "Southwest",
  CA: "West", CO: "West", HI: "West", MT: "West", NV: "West", UT: "West", WY: "West", AK: "West",
  OR: "Northwest", WA: "Northwest", ID: "Northwest",
};

const BRAND_PATTERNS: Array<{ brand: string; rx: RegExp }> = [
  { brand: "Honda", rx: /\bhonda\b/i },
  { brand: "Yamaha", rx: /\byamaha\b/i },
  { brand: "Kawasaki", rx: /\bkawasaki\b/i },
  { brand: "Suzuki", rx: /\bsuzuki\b/i },
  { brand: "Polaris", rx: /\bpolaris\b/i },
  { brand: "Can-Am", rx: /\bcan[- ]?am\b/i },
  { brand: "Sea-Doo", rx: /\bsea[- ]?doo\b/i },
  { brand: "Ski-Doo", rx: /\bski[- ]?doo\b/i },
  { brand: "Harley-Davidson", rx: /\bharley/i },
  { brand: "Indian", rx: /\bindian motorcycle/i },
  { brand: "KTM", rx: /\bktm\b/i },
  { brand: "Husqvarna", rx: /\bhusqvarna\b/i },
  { brand: "Triumph", rx: /\btriumph\b/i },
  { brand: "Ducati", rx: /\bducati\b/i },
  { brand: "BMW", rx: /\bbmw motorrad|\bbmw motor/i },
  { brand: "Aprilia", rx: /\baprilia\b/i },
  { brand: "Vespa", rx: /\bvespa\b/i },
  { brand: "Winnebago", rx: /\bwinnebago\b/i },
  { brand: "Newmar", rx: /\bnewmar\b/i },
  { brand: "Tiffin", rx: /\btiffin\b/i },
  { brand: "Forest River", rx: /\bforest river\b/i },
  { brand: "Jayco", rx: /\bjayco\b/i },
  { brand: "Coachmen", rx: /\bcoachmen\b/i },
  { brand: "Massimo", rx: /\bmassimo\b/i },
  { brand: "Moto Morini", rx: /\bmoto morini\b/i },
];

export type ScrapeStep =
  | { kind: "step"; label: string; done: boolean }
  | { kind: "snapshot"; data: DealerSnapshot }
  | { kind: "error"; message: string };

function detectStateFromText(text: string): string | null {
  const m = text.match(/\b([A-Z]{2})\s+\d{5}\b/);
  if (m && REGION_BY_STATE[m[1]]) return m[1];
  return null;
}

function detectSegments(text: string): DealerSnapshot["segments"] {
  const lc = text.toLowerCase();
  const out: DealerSnapshot["segments"] = [];
  if (/motorcycle|cruiser|sportbike|adventure bike/.test(lc)) out.push("motorcycle");
  if (/atv|side[- ]?by[- ]?side|utv|off[- ]?road/.test(lc)) out.push("atv-utv");
  if (/jet ski|pwc|watercraft|boat|marine/.test(lc)) out.push("marine");
  if (/snowmobile/.test(lc)) out.push("snowmobile");
  if (/\brv\b|motorhome|travel trailer|fifth wheel|class a|class c/.test(lc)) out.push("rv");
  if (/used cars?|pre[- ]?owned cars?|truck/.test(lc) && !/atv|motorcycle/.test(lc)) out.push("used-cars");
  if (/powersports/.test(lc) && !out.includes("powersports")) out.push("powersports");
  return out.length ? out : ["powersports"];
}

function detectBrands(text: string): string[] {
  const found = new Set<string>();
  for (const { brand, rx } of BRAND_PATTERNS) {
    if (rx.test(text)) found.add(brand);
  }
  return [...found].slice(0, 14);
}

async function fetchPage(url: string, timeoutMs = 9000): Promise<string> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export async function* scrapeDealer(rawUrl: string): AsyncGenerator<ScrapeStep, void, void> {
  let url: URL;
  try {
    url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    yield { kind: "error", message: "That URL doesn't look right. Try with the full https://..." };
    return;
  }

  yield { kind: "step", label: `Resolving ${url.host}`, done: false };

  let html: string;
  try {
    html = await fetchPage(url.toString());
  } catch (e) {
    yield {
      kind: "error",
      message:
        "Scrape blocked or timed out. Many dealer sites use bot protection. Try a curated example, or paste a different dealer URL.",
    };
    return;
  }

  yield { kind: "step", label: `Resolving ${url.host}`, done: true };
  yield { kind: "step", label: "Reading homepage and metadata", done: false };

  const $ = cheerio.load(html);
  const title = clean($("title").first().text());
  const description = clean(
    $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      ""
  );
  const bodyText = clean($("body").text()).slice(0, 8000);
  const fullText = `${title} ${description} ${bodyText}`;

  yield { kind: "step", label: "Reading homepage and metadata", done: true };
  yield { kind: "step", label: "Detecting brand mix", done: false };

  const brands = detectBrands(fullText);
  const segments = detectSegments(fullText);

  yield { kind: "step", label: "Detecting brand mix", done: true };
  yield { kind: "step", label: "Locating store and contact", done: false };

  const state = detectStateFromText(bodyText) ?? "CA";
  const region = REGION_BY_STATE[state] ?? "West";

  let city = "—";
  const addrMatch = bodyText.match(/([A-Z][a-zA-Z .'-]+),\s*([A-Z]{2})\s+\d{5}/);
  if (addrMatch) city = clean(addrMatch[1]);

  yield { kind: "step", label: "Locating store and contact", done: true };
  yield { kind: "step", label: "Sampling inventory", done: false };

  const inventorySample: DealerSnapshot["inventorySample"] = [];
  $("a, h2, h3, h4").each((_, el) => {
    if (inventorySample.length >= 8) return false;
    const t = clean($(el).text());
    const yr = t.match(/\b(20\d{2})\b/);
    const pr = t.match(/\$([\d,]+)/);
    if (yr && pr) {
      const price = parseInt(pr[1].replace(/,/g, ""), 10);
      if (price > 1500 && price < 800000 && t.length < 140) {
        inventorySample.push({
          label: t.replace(yr[0], "").replace(pr[0], "").replace(/\s+/g, " ").trim().slice(0, 80),
          year: parseInt(yr[1], 10),
          price,
          condition: t.toLowerCase().includes("used") || t.toLowerCase().includes("pre-owned") ? "used" : "new",
        });
      }
    }
    return;
  });

  yield { kind: "step", label: "Sampling inventory", done: true };

  const isRv = segments.includes("rv");
  const isUsedCars = segments.includes("used-cars");
  const estUnitsPerYear = isRv ? 600 : isUsedCars ? 3500 : 1800;
  const estAvgGrossPerUnit = isRv ? 9000 : isUsedCars ? 1900 : 1750;

  const name = title.split(/[\|·–-]/)[0].trim().slice(0, 60) || url.host.replace(/^www\./, "");

  const snapshot: DealerSnapshot = {
    id: `live:${url.host}`,
    source: "live",
    name,
    url: url.toString(),
    city,
    state,
    region,
    segments,
    brands,
    estUnitsPerYear,
    estAvgGrossPerUnit,
    inventorySample,
    signals: [
      `Detected ${brands.length} brand${brands.length === 1 ? "" : "s"} from public site content`,
      `Primary segment inference: ${segments.join(", ")}`,
      `Region inference: ${region} (state code ${state})`,
    ],
    aboutCopy: description || bodyText.slice(0, 240),
    scrapedAt: new Date().toISOString(),
  };

  yield { kind: "snapshot", data: snapshot };
}
