import { NextResponse } from "next/server";
import { getData, lookupCode, searchCodes, wardLeadRisk } from "@/lib/watermain";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "toronto-watermain-codebook", version: "1.0.0" };

const TOOLS = [
  {
    name: "watermain_lookup",
    description:
      "Full codebook entry for one Toronto watermain code (material, function, or diameter): plain-English meaning, segment count, share, and quality notes.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Code to look up, e.g. 'CI', 'DIP', '150'" },
      },
      required: ["code"],
    },
  },
  {
    name: "watermain_lead_risk",
    description:
      "Lead-era pipe classification for one Toronto ward (or all wards): rank by lead-era km, lead-era km and share of the ward network, median install year. Lead-era means construction year before 1955, per the City of Toronto's lead-service era cutoff. This is an age-based inference about pipe vintage, not a measurement of lead in any pipe.",
    inputSchema: {
      type: "object",
      properties: {
        ward: { type: "string", description: "Ward number or name, e.g. '19' or 'Beaches-East York'. Omit for all wards." },
      },
    },
  },
  {
    name: "watermain_summary",
    description:
      "Toronto watermain network summary: 49,414 segments, material mix, lead-era classes, construction-decade distribution, ward ranking, and limitations.",
    inputSchema: { type: "object", properties: {} },
  },
];

interface JsonRpcMessage {
  jsonrpc?: string;
  method?: string;
  id?: unknown;
  params?: { name?: string; arguments?: Record<string, unknown> };
}

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: JsonRpcMessage | null) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: rawArgs } = msg.params ?? {};
      const args: Record<string, unknown> = rawArgs ?? {};
      try {
        if (name === "watermain_lookup") {
          const code = String(args.code ?? "");
          const hit = lookupCode(code) ?? searchCodes(code, "")[0] ?? null;
          if (!hit) return err(id, -32001, `No codebook entry for ${code}`);
          return ok(id, textResult(hit));
        }
        if (name === "watermain_lead_risk") {
          const ward = String(args.ward ?? "");
          const { summary } = getData();
          if (!ward) {
            return ok(id, textResult({
              classes: summary.lead.classes,
              wards: summary.wards,
              note: "Lead-era means construction year before 1955, per the City of Toronto's lead-service era cutoff. Era-based inference, not a lead measurement.",
            }));
          }
          const hit = wardLeadRisk(ward);
          if (!hit) return err(id, -32001, `No ward ${ward}`);
          return ok(id, textResult({ ...hit, rule: summary.lead.classes.lead_era.rule }));
        }
        if (name === "watermain_summary") {
          const { summary } = getData();
          return ok(id, textResult(summary));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: JsonRpcMessage | JsonRpcMessage[];
  try {
    body = (await req.json()) as JsonRpcMessage | JsonRpcMessage[];
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}
