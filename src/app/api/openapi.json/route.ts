import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Toronto Watermain Codebook API",
    version: "1.0.0",
    description:
      "Toronto's 49,414 watermain segments decoded: 18 material codes in plain English, diameters, function codes, and a lead-era classification (construction year before 1955, per the City of Toronto's lead-service era cutoff). The lead-era flag is an age-based inference about pipe vintage, not a measurement of lead. Source: City of Toronto Open Data (Watermains). MIT licensed.",
  },
  servers: [{ url: "https://canada.nshipyard.com/api/v1" }],
  paths: {
    "/watermain/codes": {
      get: {
        summary: "Search the pipe codebook by code or meaning, optionally filtered by code type",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "ductile" },
          { name: "type", in: "query", required: false, schema: { type: "string", enum: ["material", "type", "diameter_mm"] } },
        ],
        responses: { "200": { description: "61 documented codes filtered by the query" } },
      },
    },
    "/watermain/lead": {
      get: {
        summary: "Lead-era classification: network totals, or one ward's rank, lead-era km, and share",
        parameters: [
          { name: "ward", in: "query", required: false, schema: { type: "string" }, example: "19" },
        ],
        responses: { "200": { description: "Lead-era classes and ward ranking" }, "404": { description: "No such ward" } },
      },
    },
    "/watermain/summary": {
      get: {
        summary: "Network totals, material mix, lead classes, decade distribution, ward ranking, limitations",
        responses: { "200": { description: "Full summary document" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
