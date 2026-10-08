"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/watermain/codes?q=ductile&type=material",
    desc: "Search the codebook by code or meaning, optionally filtered by code type",
    response: `{
  "q": "ductile",
  "type": "material",
  "rows": [
    { "code_type": "material", "code": "DIP",
      "meaning": "Ductile Iron Pipe",
      "count": 4440, "pct": 8.99,
      "notes": "Ductile (nodular) cast iron; …" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/watermain/lead?ward=19",
    desc: "Lead-era classification for one ward: rank, lead-era km, share of network",
    response: `{
  "ward": "19", "name": "Beaches-East York",
  "rank": 2, "lead_era_km": 164.7,
  "lead_era_pct": 79.8, "median_year": 1948,
  "rule": "Construction year before 1955 …"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/watermain/summary",
    desc: "Network totals, material mix, lead classes, decade distribution, ward ranking",
    response: `{ "meta": { "segments": 49414, "total_km": 6131.6, … },
  "materials": [ { "code": "CI", "count": 25359 }, … ],
  "lead": { "classes": { "lead_era": { "segments": 16949 } } },
  "wards": [ … ] }`,
  },
];

export default function Developers() {
  const { t } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {endpoints.map((e) => (
            <article key={e.path} className="flex flex-col rounded-[24px] border border-white/15 bg-white/5 p-6">
              <p className="font-mono text-[12px] font-semibold text-white/60">{e.method}</p>
              <code className="mt-1 break-all font-mono text-[13px] text-white">{e.path}</code>
              <p className="mt-2 text-[14px] text-white/65">{e.desc}</p>
              <pre className="mt-4 flex-1 overflow-x-auto rounded-[16px] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/80">
                {e.response}
              </pre>
              <a
                href={e.path}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block self-start rounded-full border border-white/25 px-5 py-2 text-[14px] font-semibold hover:border-white"
              >
                {t.developers.tryIt} →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="block rounded-[24px] bg-white/[0.06] p-6 hover:bg-white/[0.09]">
            <h4 className="text-[19px] font-semibold">{t.developers.openapi}</h4>
            <code className="mt-2 block font-mono text-[13px] text-white/60">GET /api/openapi.json</code>
          </a>
        </div>

        <McpConnect
          config={{
            slug: "toronto-watermain",
            displayName: "Toronto Watermain Codebook",
            exampleEn: "Look up material code CI and tell me its lead-era share",
            exampleFr: "Cherche le code de matériau CI et donne-moi sa part datant de l'ère du plomb",
          }}
        />
      </div>
    </section>
  );
}
