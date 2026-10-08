import { NextResponse } from "next/server";
import { getData, wardLeadRisk } from "@/lib/watermain";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ward = searchParams.get("ward") ?? "";
  const { summary } = getData();
  if (!ward) {
    return NextResponse.json({
      classes: summary.lead.classes,
      wards: summary.wards,
      note: "Lead-era means construction year before 1955, per the City of Toronto's lead-service era cutoff. Era-based inference, not a lead measurement.",
    });
  }
  const hit = wardLeadRisk(ward);
  if (!hit) return NextResponse.json({ error: `No ward ${ward}` }, { status: 404 });
  return NextResponse.json({
    ...hit,
    rule: summary.lead.classes.lead_era.rule,
  });
}
