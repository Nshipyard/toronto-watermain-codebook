"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

interface CodeRow {
  code_type: string;
  code: string;
  meaning: string;
  count: number;
  pct: number;
  notes: string;
}

const TYPE_ORDER = ["material", "type", "diameter_mm"];

export default function Explorer() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [codeType, setCodeType] = useState("");
  const [rows, setRows] = useState<CodeRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function run(query: string, ct: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, type: ct });
      const res = await fetch(`/api/v1/watermain/codes?${params}`);
      const data = await res.json();
      setRows(data.rows ?? []);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => run(q, codeType), 300);
    return () => clearTimeout(id);
  }, [q, codeType]);

  function typeLabel(ct: string) {
    const map = t.explorer.types as Record<string, string>;
    return map[ct] ?? ct;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.explorer.search}
          className="w-full rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none placeholder:text-ink/35 focus:border-canada"
          aria-label={t.explorer.search}
        />
        <select
          value={codeType}
          onChange={(e) => setCodeType(e.target.value)}
          className="rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none focus:border-canada md:w-[280px]"
          aria-label={t.explorer.type}
        >
          <option value="">{t.explorer.allTypes}</option>
          {TYPE_ORDER.map((ct) => (
            <option key={ct} value={ct}>
              {typeLabel(ct)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {!searched && !loading && (
          <p className="max-w-[640px] text-[15px] leading-relaxed text-ink/55">{t.explorer.empty}</p>
        )}
        {loading && <p className="text-[15px] text-ink/55">…</p>}
        {searched && !loading && rows.length === 0 && (
          <p className="text-[15px] text-ink/55">{t.explorer.noResult}</p>
        )}
        {rows.length > 0 && (
          <>
            <p className="mb-4 text-[14px] text-ink/55">
              {t.explorer.showing} {rows.length} {t.explorer.of} 61 {t.explorer.codes}
            </p>
            <div className="overflow-x-auto rounded-[24px] border border-line">
              <table className="w-full min-w-[860px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-line bg-muted text-[12px] uppercase tracking-wide text-ink/55">
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.code}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.type}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.meaning}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.segments}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.share}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.code_type}:${r.code}`} className="border-b border-line last:border-0 hover:bg-paper-warm">
                      <td className="px-5 py-3.5 font-mono font-semibold">{r.code}</td>
                      <td className="px-5 py-3.5 text-ink/60">{typeLabel(r.code_type)}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{r.meaning}</p>
                        <p className="mt-1 text-[13px] leading-snug text-ink/55">{r.notes}</p>
                      </td>
                      <td className="px-5 py-3.5 tabular-nums">{r.count.toLocaleString()}</td>
                      <td className="px-5 py-3.5 tabular-nums">{r.pct.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
