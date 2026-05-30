export type DealerSnapshot = {
  id: string;
  source: "curated" | "live";
  name: string;
  url: string;
  city: string;
  state: string;
  region: "Northeast" | "Southeast" | "Midwest" | "Southwest" | "West" | "Northwest";
  segments: Array<"motorcycle" | "powersports" | "rv" | "used-cars" | "atv-utv" | "snowmobile" | "marine">;
  brands: string[];
  estUnitsPerYear: number;
  estAvgGrossPerUnit: number;
  inventorySample: Array<{
    label: string;
    year: number;
    price: number;
    condition: "new" | "used";
  }>;
  signals: string[];
  aboutCopy: string;
  scrapedAt: string;
};

export type EkhoCompetitor = {
  name: string;
  city: string;
  state: string;
  region: DealerSnapshot["region"];
  segment: DealerSnapshot["segments"][number];
  ekhoProducts: Array<"Digital Storefront" | "Growth Engine" | "Sales Accelerator" | "Operating System">;
  oneLiner: string;
};

export type ScrapeEvent =
  | { kind: "step"; label: string; done: boolean }
  | { kind: "snapshot"; data: DealerSnapshot }
  | { kind: "error"; message: string };

export type RubricScore = {
  dimension:
    | "factual_grounding"
    | "specificity"
    | "voice_match"
    | "insight_quality"
    | "outbound_discipline"
    | "anti_sycophancy";
  score: 1 | 2 | 3 | 4 | 5;
  note: string;
};

export type Flag = {
  excerpt: string;
  dimension: RubricScore["dimension"];
  why: string;
  severity: "low" | "med" | "high";
};

export type EvalReport = {
  scores: RubricScore[];
  flags: Flag[];
  overall: 1 | 2 | 3 | 4 | 5;
};

export type EmailDraft = {
  id: "open" | "follow_up" | "close";
  subject: string;
  body: string;
};

export type Brief = {
  briefMarkdown: string;
  emails: EmailDraft[];
};
