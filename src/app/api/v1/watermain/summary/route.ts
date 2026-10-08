import { NextResponse } from "next/server";
import { getData } from "@/lib/watermain";

export async function GET() {
  const { summary } = getData();
  return NextResponse.json(summary);
}
