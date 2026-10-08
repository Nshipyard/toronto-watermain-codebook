import { NextResponse } from "next/server";
import { searchCodes } from "@/lib/watermain";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const rows = searchCodes(q, type);
  return NextResponse.json({ q, type, total: 61, rows });
}
