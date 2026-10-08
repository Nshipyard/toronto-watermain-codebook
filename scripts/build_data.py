#!/usr/bin/env python3
"""Build the toronto-watermain-codebook data files from City of Toronto open data.

Reads data/raw/distribution.geojson + transmission.geojson (CKAN datastore
dumps of the 'Watermains' package; CSV content), assigns each segment to a
municipal ward by midpoint, and writes:
  data/watermain_codebook.csv  - every material/type/diameter code documented
  data/lead_classification.csv - per-segment lead-era classification
  data/summary.json            - aggregates for the app/API
Raw files are never modified.
"""

import csv
import json
from collections import Counter, defaultdict
from shapely.geometry import Point, shape

RAW = "data/raw"
RETRIEVED = "2026-10-08"

MATERIAL_MEANINGS = {
    "CI": ("Cast Iron", "Grey cast iron, the oldest common watermain material in Toronto; dominant from the 1870s through the 1960s. Brittle relative to ductile iron, which is why break rates rise with age."),
    "DIP": ("Ductile Iron Pipe", "Ductile (nodular) cast iron; stronger and more flexible than grey cast iron. Became the standard iron pipe from the 1960s on."),
    "DICL": ("Ductile Iron, Cement Lined", "Ductile iron pipe with a cement-mortar lining that protects against internal corrosion."),
    "CICL": ("Cast Iron, Cement Lined", "Grey cast iron pipe with a cement-mortar lining."),
    "PVC": ("Polyvinyl Chloride", "Rigid plastic pipe; light, corrosion-proof, and the most common modern material for small-diameter distribution mains from the 1970s on."),
    "PVCO": ("Oriented PVC", "Molecularly oriented PVC; a higher-strength variant of PVC pipe."),
    "AC": ("Asbestos Cement", "Cement pipe reinforced with asbestos fiber, widely installed mid-20th century. The fibers are bound in the cement matrix; handling concern is mainly dust during cutting or repair, not the delivered water."),
    "CPP": ("Concrete Pressure Pipe", "Steel-cylinder concrete pipe for pressure service, used on larger diameters."),
    "PCPP": ("Prestressed Concrete Cylinder Pipe", "Concrete pressure pipe with prestressed steel wire wrapping; used on large transmission diameters."),
    "CONC": ("Concrete", "Concrete pipe, non-prestressed."),
    "CONP": ("Concrete Pipe", "Concrete pipe variant as coded by the source; distinct code from CONC in the data."),
    "SP": ("Steel Pipe", "Welded steel pipe, dominant material for large-diameter transmission mains."),
    "SPCL": ("Steel Pipe, Cement Lined", "Steel pipe with cement-mortar lining."),
    "COP": ("Copper", "Copper pipe; appears on small-diameter segments, typically service-sized connections rather than street mains."),
    "PE": ("Polyethylene", "Flexible plastic pipe."),
    "HDPE": ("High-Density Polyethylene", "High-density polyethylene; flexible, fusion-joined plastic pipe."),
    "UNK": ("Unknown", "Material not recorded in the source system. 830 segments carry no material information."),
    "None": ("No value", "Source field contains the literal string 'None'; treated as missing, not as a material."),
}

TYPE_MEANINGS = {
    "0": ("Distribution", "Distribution watermain: the smaller street-level pipes that deliver water to properties. Every segment in the distribution file carries this code."),
    "1": ("Transmission (class 1)", "Transmission watermain: large regional pipes moving water between facilities. The source codes function numerically but publishes no definitions; class 1 is the main transmission class in the file."),
    "2": ("Transmission (class 2)", "Second transmission class in the source coding; 428 segments. Meaning unpublished by the source."),
}

LEAD_CUTOFF = 1955  # City of Toronto: lead service pipes affect homes built before the mid-1950s

LEAD_RULES = {
    "lead_coded": "Material code explicitly indicating lead. No such code exists in this dataset, so this class is empty by construction.",
    "lead_era": f"Construction year before {LEAD_CUTOFF}. The City of Toronto states lead water service pipes affect homes built before the mid-1950s. This flag marks pipe vintages from that era, i.e. areas where lead service connections are more likely nearby. It is an age-based inference, not a measurement of lead in these pipes.",
    "modern": f"Construction year {LEAD_CUTOFF} or later. Outside the City's lead-service era.",
    "unknown_vintage": "No construction year recorded; cannot be classified by era.",
}


def load_wards():
    with open(f"{RAW}/wards25.geojson") as f:
        gj = json.load(f)
    wards = []
    for feat in gj["features"]:
        p = feat["properties"]
        wards.append({
            "code": str(p["AREA_SHORT_CODE"]).zfill(2),
            "name": p["AREA_NAME"],
            "geom": shape(feat["geometry"]),
        })
    return wards


def midpoint(coords):
    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]
    return (sum(xs) / len(xs), sum(ys) / len(ys))


def load_segments(wards):
    segs = []
    for fname, file_label in [("distribution.geojson", "distribution"),
                              ("transmission.geojson", "transmission")]:
        with open(f"{RAW}/{fname}", newline="") as f:
            r = csv.DictReader(f)
            for row in r:
                try:
                    geom = json.loads(row["geometry"])
                    mx, my = midpoint(geom["coordinates"])
                except Exception:
                    mx, my = None, None
                ward_code, ward_name = "", ""
                if mx is not None:
                    pt = Point(mx, my)
                    for w in wards:
                        if w["geom"].contains(pt):
                            ward_code, ward_name = w["code"], w["name"]
                            break
                y = (row.get("Watermain Construction Year") or "").strip()
                try:
                    year = int(float(y)) if y else None
                except ValueError:
                    year = None
                try:
                    length = float(row.get("Watermain Measured Length") or 0) or 0.0
                except ValueError:
                    length = 0.0
                mat = (row.get("Watermain Material") or "").strip()
                if year is None:
                    lead_class = "unknown_vintage"
                elif year < LEAD_CUTOFF:
                    lead_class = "lead_era"
                else:
                    lead_class = "modern"
                segs.append({
                    "asset_id": (row.get("Watermain Asset Identification") or "").strip(),
                    "file": file_label,
                    "type": (row.get("Watermain Type") or "").strip(),
                    "diameter": (row.get("Watermain Diameter") or "").strip(),
                    "material": mat,
                    "year": year,
                    "length_m": length,
                    "ward": ward_code,
                    "ward_name": ward_name,
                    "lead_class": lead_class,
                })
    return segs


def main():
    wards = load_wards()
    segs = load_segments(wards)
    n = len(segs)
    print(f"segments: {n}")

    # ---- codebook ----
    mat_c = Counter(s["material"] for s in segs)
    type_c = Counter(s["type"] for s in segs)
    diam_c = Counter(s["diameter"] for s in segs if s["diameter"])
    rows = []
    for code, cnt in mat_c.most_common():
        meaning, notes = MATERIAL_MEANINGS.get(code, ("Unlisted code", "Code appears in the data but is not in the standard industry list; flagged for review."))
        rows.append(["material", code, meaning, cnt, round(cnt / n * 100, 2), notes])
    for code, cnt in type_c.most_common():
        meaning, notes = TYPE_MEANINGS.get(code, ("Unlisted code", "Meaning unpublished by the source."))
        rows.append(["type", code, meaning, cnt, round(cnt / n * 100, 2), notes])
    for code, cnt in diam_c.most_common():
        rows.append(["diameter_mm", code, f"Nominal diameter {code} mm (units inferred from standard pipe sizes; the source does not label units)",
                     cnt, round(cnt / n * 100, 2),
                     "150 mm (6 in) is the standard residential distribution size; it carries over half of all segments."])
    with open("data/watermain_codebook.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["code_type", "code", "meaning", "count", "pct", "notes"])
        w.writerows(rows)
    print(f"codebook rows: {len(rows)}")

    # ---- lead classification ----
    with open("data/lead_classification.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["asset_id", "file", "material", "diameter_mm", "construction_year",
                    "length_m", "ward", "ward_name", "lead_class", "rule"])
        for s in segs:
            w.writerow([s["asset_id"], s["file"], s["material"], s["diameter"],
                        s["year"] if s["year"] is not None else "",
                        round(s["length_m"], 2), s["ward"], s["ward_name"],
                        s["lead_class"], LEAD_RULES[s["lead_class"]][:160]])
    lead_c = Counter(s["lead_class"] for s in segs)
    print("lead classes:", dict(lead_c))

    # ---- summary ----
    dist = [s for s in segs if s["file"] == "distribution"]
    ward_stats = {}
    for s in dist:
        if not s["ward"]:
            continue
        ws = ward_stats.setdefault(s["ward"], {"ward": s["ward"], "name": s["ward_name"],
                                               "segments": 0, "km": 0.0, "lead_era_km": 0.0,
                                               "years": []})
        ws["segments"] += 1
        ws["km"] += s["length_m"] / 1000
        if s["lead_class"] == "lead_era":
            ws["lead_era_km"] += s["length_m"] / 1000
        if s["year"]:
            ws["years"].append(s["year"])
    ward_list = []
    for code in sorted(ward_stats):
        ws = ward_stats[code]
        yrs = sorted(ws["years"])
        med = yrs[len(yrs) // 2] if yrs else None
        ward_list.append({"ward": ws["ward"], "name": ws["name"], "segments": ws["segments"],
                          "km": round(ws["km"], 1), "lead_era_km": round(ws["lead_era_km"], 1),
                          "lead_era_pct": round(ws["lead_era_km"] / ws["km"] * 100, 1) if ws["km"] else 0,
                          "median_year": med})
    ward_list.sort(key=lambda x: -x["lead_era_km"])

    decades = Counter()
    for s in segs:
        if s["year"]:
            decades[s["year"] // 10 * 10] += 1

    lead_era_mats = Counter(s["material"] for s in segs if s["lead_class"] == "lead_era")
    no_ward = sum(1 for s in dist if not s["ward"])

    summary = {
        "meta": {
            "source": "City of Toronto Open Data, 'Watermains' package (distribution + transmission)",
            "source_url": "https://open.toronto.ca/dataset/watermains/",
            "retrieved": RETRIEVED,
            "licence": "Open Government Licence - Toronto",
            "segments": n,
            "distribution_segments": len(dist),
            "transmission_segments": n - len(dist),
            "total_km": round(sum(s["length_m"] for s in segs) / 1000, 1),
            "lead_cutoff_year": LEAD_CUTOFF,
            "lead_cutoff_basis": "City of Toronto: lead water service pipes affect homes built before the mid-1950s (toronto.ca Lead & Drinking Water).",
            "units_note": "Diameter units are not labeled by the source; millimetres inferred from standard pipe sizes.",
            "type_note": "Watermain Type is coded numerically (0/1/2); the source publishes no definitions. Meanings above are inferred from file context.",
        },
        "materials": [{"code": code, "meaning": MATERIAL_MEANINGS.get(code, ("?",))[0],
                       "count": cnt, "pct": round(cnt / n * 100, 2)}
                      for code, cnt in mat_c.most_common()],
        "diameters": [{"diameter_mm": code, "count": cnt, "pct": round(cnt / n * 100, 2)}
                      for code, cnt in diam_c.most_common(12)],
        "lead": {
            "classes": {k: {"segments": lead_c.get(k, 0),
                            "km": round(sum(s["length_m"] for s in segs if s["lead_class"] == k) / 1000, 1),
                            "rule": v}
                        for k, v in LEAD_RULES.items()},
            "lead_era_materials": [{"code": c, "count": cnt} for c, cnt in lead_era_mats.most_common(8)],
            "dist_lead_era_km": round(sum(s["length_m"] for s in dist if s["lead_class"] == "lead_era") / 1000, 1),
            "dist_km": round(sum(s["length_m"] for s in dist) / 1000, 1),
        },
        "decades": [{"decade": d, "segments": c} for d, c in sorted(decades.items())],
        "wards": ward_list,
        "limitations": [
            "The dataset documents watermains (street pipes), not water service connections. Toronto's lead risk is about service pipes, so nothing here directly measures lead; the lead-era flag is an age-based geographic proxy.",
            "No segment carries an explicit lead material code, so the 'lead (as coded)' class is empty.",
            "731 segments (1.5%) have no construction year and cannot be era-classified.",
            f"{no_ward} distribution segments fall outside all 25 ward polygons by midpoint and are excluded from ward analysis.",
            "Diameter units and Watermain Type meanings are inferred, not published by the source.",
            "Corrosion control (phosphate added since 2014, per the City) reduces lead leaching but does not remove lead pipes; era is about pipe inventory, not current water quality.",
        ],
    }
    with open("data/summary.json", "w") as f:
        json.dump(summary, f, indent=1)
    print("summary written")
    print("top lead-era wards:", [(w["ward"], w["name"], w["lead_era_km"]) for w in ward_list[:5]])


if __name__ == "__main__":
    main()
