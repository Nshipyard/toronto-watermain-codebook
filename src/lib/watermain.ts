import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export interface CodebookRow {
  code_type: string;
  code: string;
  meaning: string;
  count: number;
  pct: number;
  notes: string;
}

export interface MaterialStat {
  code: string;
  meaning: string;
  count: number;
  pct: number;
}

export interface DiameterStat {
  diameter_mm: string;
  count: number;
  pct: number;
}

export interface LeadClass {
  segments: number;
  km: number;
  rule: string;
}

export interface DecadeStat {
  decade: number;
  segments: number;
}

export interface WardStat {
  ward: string;
  name: string;
  segments: number;
  km: number;
  lead_era_km: number;
  lead_era_pct: number;
  median_year: number | null;
}

export interface SummaryMeta {
  source: string;
  source_url: string;
  retrieved: string;
  licence: string;
  segments: number;
  distribution_segments: number;
  transmission_segments: number;
  total_km: number;
  lead_cutoff_year: number;
  lead_cutoff_basis: string;
  units_note: string;
  type_note: string;
}

export interface Summary {
  meta: SummaryMeta;
  materials: MaterialStat[];
  diameters: DiameterStat[];
  lead: {
    classes: Record<string, LeadClass>;
    lead_era_materials: { code: string; count: number }[];
    dist_lead_era_km: number;
    dist_km: number;
  };
  decades: DecadeStat[];
  wards: WardStat[];
  limitations: string[];
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const vals: string[] = [];
    let cur = "",
      inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        vals.push(cur);
        cur = "";
      } else cur += ch;
    }
    vals.push(cur);
    const o: Record<string, string> = {};
    headers.forEach((h, i) => (o[h] = vals[i] ?? ""));
    return o;
  });
}

interface Cache {
  summary: Summary;
  codebook: CodebookRow[];
}

let cache: Cache | null = null;

export function getData(): Cache {
  if (cache) return cache;
  const summary = JSON.parse(
    fs.readFileSync(path.join(DATA, "summary.json"), "utf8")
  ) as Summary;
  const codebook = parseCsv(
    fs.readFileSync(path.join(DATA, "watermain_codebook.csv"), "utf8")
  ).map((r) => ({
    code_type: r.code_type,
    code: r.code,
    meaning: r.meaning,
    count: parseInt(r.count, 10) || 0,
    pct: parseFloat(r.pct) || 0,
    notes: r.notes,
  }));
  cache = { summary, codebook };
  return cache;
}

export function searchCodes(q: string, codeType: string): CodebookRow[] {
  const { codebook } = getData();
  const needle = q.trim().toLowerCase();
  return codebook.filter((r) => {
    if (codeType && r.code_type !== codeType) return false;
    if (!needle) return true;
    return (
      r.code.toLowerCase().includes(needle) ||
      r.meaning.toLowerCase().includes(needle) ||
      r.notes.toLowerCase().includes(needle)
    );
  });
}

export function lookupCode(code: string): CodebookRow | null {
  const { codebook } = getData();
  const needle = code.trim().toUpperCase();
  return codebook.find((r) => r.code.toUpperCase() === needle) ?? null;
}

export function wardLeadRisk(ward: string): (WardStat & { rank: number }) | null {
  const { summary } = getData();
  const needle = ward.trim().toLowerCase();
  const idx = summary.wards.findIndex(
    (w) => w.ward === needle || w.ward === needle.padStart(2, "0") || w.name.toLowerCase().includes(needle)
  );
  if (idx < 0) return null;
  return { ...summary.wards[idx], rank: idx + 1 };
}
