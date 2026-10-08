"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

interface Ward {
  ward: string;
  name: string;
  segments: number;
  km: number;
  lead_era_km: number;
  lead_era_pct: number;
  median_year: number | null;
}

interface Decade {
  decade: number;
  segments: number;
}

interface LeadMat {
  code: string;
  count: number;
}

export default function Showcase() {
  const { t } = useLang();
  const [wards, setWards] = useState<Ward[]>([]);
  const [decades, setDecades] = useState<Decade[]>([]);
  const [leadMats, setLeadMats] = useState<LeadMat[]>([]);
  const [leadTotal, setLeadTotal] = useState(0);

  useEffect(() => {
    fetch("/api/v1/watermain/summary")
      .then((r) => r.json())
      .then((d) => {
        setWards((d.wards ?? []).slice(0, 10));
        setDecades(d.decades ?? []);
        const lm: LeadMat[] = d.lead?.lead_era_materials ?? [];
        setLeadMats(lm.slice(0, 6));
        setLeadTotal(d.lead?.classes?.lead_era?.segments ?? 0);
      });
  }, []);

  const maxKm = Math.max(1, ...wards.map((w) => w.lead_era_km));
  const maxDec = Math.max(1, ...decades.map((d) => d.segments));
  const maxMat = Math.max(1, ...leadMats.map((m) => m.count));

  return (
    <section id="showcase" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.showcase.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.showcase.title}</h2>
        <p className="mt-5 max-w-[760px] text-[18px] leading-relaxed text-ink/70">{t.showcase.body}</p>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[24px] border border-line bg-paper-warm p-7">
            <h3 className="display text-[28px]">{t.showcase.wardTitle}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{t.showcase.wardSub}</p>
            <div className="mt-6 space-y-4">
              {wards.map((w) => (
                <div key={w.ward}>
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="min-w-0 font-medium">
                      {w.ward} · {w.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-ink/60">
                      {w.lead_era_km.toFixed(1)} {t.showcase.leadEraKm} · {w.lead_era_pct.toFixed(1)}% {t.showcase.ofNetwork}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-canada"
                      style={{ width: `${(w.lead_era_km / maxKm) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-line bg-paper-warm p-7">
            <h3 className="display text-[28px]">{t.showcase.ageTitle}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{t.showcase.ageBody}</p>
            <div className="mt-6 flex h-44 items-end gap-1.5">
              {decades.map((d) => (
                <div key={d.decade} className="flex flex-1 flex-col items-center gap-1.5" title={`${d.decade}s: ${d.segments.toLocaleString()}`}>
                  <div
                    className={`w-full rounded-t-[6px] ${d.decade < 1955 ? "bg-canada" : "bg-ink/20"}`}
                    style={{ height: `${Math.max(3, (d.segments / maxDec) * 130)}px` }}
                  />
                  <span className="text-[10px] tabular-nums text-ink/50">{String(d.decade).slice(2)}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-ink/50">
              <span className="mr-3"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-canada align-middle" /> pre-1955</span>
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-ink/20 align-middle" /> 1955+</span>
            </p>
          </article>
        </div>

        <article className="mt-5 rounded-[24px] border border-line bg-paper-warm p-7">
          <h3 className="display text-[28px]">{t.showcase.matTitle}</h3>
          <p className="mt-2 max-w-[760px] text-[14px] leading-relaxed text-ink/60">{t.showcase.matBody}</p>
          <div className="mt-6 space-y-3">
            {leadMats.map((m) => (
              <div key={m.code} className="flex items-center gap-4">
                <code className="w-16 shrink-0 font-mono text-[14px] font-semibold">{m.code}</code>
                <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line/60">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${(m.count / maxMat) * 100}%` }} />
                </div>
                <span className="w-28 shrink-0 text-right text-[14px] tabular-nums text-ink/60">
                  {m.count.toLocaleString()} · {((m.count / Math.max(1, leadTotal)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-[16px] border border-canada/30 bg-canada/5 p-5 text-[14px] leading-relaxed text-ink/75">
            {t.showcase.hedge}
          </p>
        </article>
      </div>
    </section>
  );
}
