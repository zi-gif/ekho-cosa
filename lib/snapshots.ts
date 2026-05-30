import { promises as fs } from "node:fs";
import path from "node:path";
import type { DealerSnapshot } from "@/lib/types";

const DIR = path.join(process.cwd(), "data", "dealer-snapshots");

let cache: DealerSnapshot[] | null = null;

export async function getCuratedDealers(): Promise<DealerSnapshot[]> {
  if (cache) return cache;
  const files = await fs.readdir(DIR);
  const loaded = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(DIR, f), "utf-8");
        return JSON.parse(raw) as DealerSnapshot;
      })
  );
  cache = loaded.sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export async function getCuratedDealerById(id: string): Promise<DealerSnapshot | null> {
  const all = await getCuratedDealers();
  return all.find((d) => d.id === id) ?? null;
}
