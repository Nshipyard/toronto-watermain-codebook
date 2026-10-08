"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: { explorer: "Explorer", showcase: "Showcase", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Nshipyard Canada · Project 03",
    title: "Toronto's watermains, decoded.",
    sub: "Watermains are the large pipes under the street that carry drinking water across the city. Toronto publishes the location, diameter, material, and install year of every segment it manages: 49,414 segments, 6,131.6 km. Material arrives as unexplained codes like CI and DICL, and nothing flags which pipes date from the era of lead service connections. This is the codebook: 18 material codes documented in plain English with counts and quality notes, plus a lead-era classification built on the City's own mid-1950s cutoff.",
    cta1: "Explore the codebook",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "49,414", label: "watermain segments documented, 6,131.6 km of pipe across the distribution and transmission networks" },
    { value: "18", label: "material codes decoded: cast iron, ductile iron, PVC, steel, concrete and the rest, each with counts and notes" },
    { value: "16,949", label: "segments installed before 1955, the City's lead-service era cutoff, covering 2,014.9 km" },
    { value: "25", label: "wards ranked by lead-era pipe, showing where the oldest network concentrates" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "Search the codebook.",
    search: "Search by code or meaning, e.g. CI, ductile, 150…",
    type: "Code type",
    allTypes: "All types",
    types: { material: "Material", type: "Pipe function", diameter_mm: "Diameter" },
    cols: { code: "Code", type: "Type", meaning: "Meaning", segments: "Segments", share: "Share" },
    showing: "Showing",
    of: "of",
    codes: "codes",
    noResult: "No codes match.",
    empty: "Search by code or meaning above, or filter by code type, to browse the 61 documented codes.",
  },
  showcase: {
    kicker: "Showcase",
    title: "Where the lead-era network concentrates.",
    body: "The raw file lists install years; it cannot tell you which wards carry the oldest pipes. Joining 46,923 distribution segments to ward boundaries by segment midpoint reveals the pattern: Toronto-St. Paul's has 84.2% of its distribution network dating from before 1955, the highest share in the city. Etobicoke-Lakeshore carries the most lead-era pipe by length at 206.0 km. The lead-era cohort is 91.6% cast iron.",
    wardTitle: "Lead-era pipe by ward",
    wardSub: "Distribution network installed before 1955, the City of Toronto's lead-service era cutoff. Length in km, and share of each ward's network.",
    leadEraKm: "lead-era km",
    ofNetwork: "of ward network",
    ageTitle: "The network's age, by decade",
    ageBody: "Segments by construction decade. Two build waves stand out: the post-war expansion of the 1950s with 8,339 segments, and the 2000s-2010s replacement wave with 9,772 segments combined. Pipes from the 1870s are still in the file: 752 segments predate 1880.",
    segments: "segments",
    matTitle: "What the lead-era pipes are made of",
    matBody: "15,528 of the 16,949 lead-era segments are cast iron. The classification is era-based, not a lead measurement: no segment in the dataset carries an explicit lead material code.",
    hedge: "What this does not say: these are watermains, the street pipes, not service connections. Toronto's lead risk is about service pipes, the small lines from the main to the house. This flag marks where lead-era services are more likely nearby; it never states that a pipe contains lead.",
  },
  methodology: {
    kicker: "Methodology",
    title: "How the codebook was built, and where it is weak.",
    items: [
      "Source: the City of Toronto open data “Watermains” package, retrieved 2026-10-08. Distribution: 46,923 segments, 5,586.4 km. Transmission: 2,491 segments, 545.2 km. The City updates it daily.",
      "Material codes are decoded from standard water-industry usage; the source publishes no codebook, which is why this project exists. Diameter units are inferred as millimetres from standard pipe sizes. Watermain Type codes (0, 1, 2) are inferred from file context.",
      "Lead rule: construction year before 1955 counts as lead-era, from the City of Toronto's statement that lead water service pipes affect homes built before the mid-1950s. That gives 16,949 segments and 2,014.9 km. No segment carries an explicit lead material code.",
      "Measured versus inferred: the dataset measures pipe location, material code, diameter, and install year. Lead content is never measured; the era flag is inferred. Health conclusions are out of scope.",
      "731 segments (1.5%) have no construction year and cannot be era-classified. 830 segments have no material recorded (UNK).",
      "Wards are assigned by segment midpoint against the City's 25-ward model. Segments falling outside every ward polygon are excluded from the ward tables.",
      "Corrosion control: the City has added phosphate at its treatment plants since 2014, which lowers lead leaching. Era describes the pipe inventory in the ground, not current water quality.",
    ],
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same canonical data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: watermain_lookup, watermain_lead_risk, watermain_summary.",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "The codebook and the per-segment classification, MIT licensed, as CSV.",
    files: [
      { name: "watermain_codebook.csv", desc: "61 codes: 18 materials, 3 function codes, diameters, with meanings, counts, and notes" },
      { name: "lead_classification.csv", desc: "49,414 segments with lead-era classification, ward, and the rule applied" },
    ],
    download: "Download",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Pipe source: City of Toronto Open Data (Watermains), Open Government Licence - Toronto. Lead-era cutoff: City of Toronto, Lead & Drinking Water.",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Explorateur", showcase: "Vitrine", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Nshipyard Canada · Projet 03",
    title: "Les conduites d'eau de Toronto, décodées.",
    sub: "Les conduites d'eau principales sont les gros tuyaux sous la rue qui transportent l'eau potable dans toute la ville. Toronto publie l'emplacement, le diamètre, le matériau et l'année d'installation de chaque tronçon qu'elle gère : 49 414 tronçons, 6 131,6 km. Le matériau arrive sous forme de codes inexpliqués comme CI et DICL, et rien n'indique quels tuyaux datent de l'époque des branchements en plomb. Voici le répertoire : 18 codes de matériaux documentés en langage clair avec chiffres et notes de qualité, plus une classification « époque du plomb » fondée sur le seuil municipal du milieu des années 1950.",
    cta1: "Explorer le répertoire",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "49 414", label: "tronçons de conduites documentés, 6 131,6 km de tuyaux sur les réseaux de distribution et de transport" },
    { value: "18", label: "codes de matériaux décodés : fonte, fonte ductile, PVC, acier, béton et les autres, chacun avec chiffres et notes" },
    { value: "16 949", label: "tronçons installés avant 1955, le seuil municipal de l'époque du plomb, soit 2 014,9 km" },
    { value: "25", label: "arrondissements classés par conduites de l'époque du plomb, montrant où se concentre le réseau le plus ancien" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "Recherchez dans le répertoire.",
    search: "Rechercher par code ou signification, p. ex. CI, ductile, 150…",
    type: "Type de code",
    allTypes: "Tous les types",
    types: { material: "Matériau", type: "Fonction du tuyau", diameter_mm: "Diamètre" },
    cols: { code: "Code", type: "Type", meaning: "Signification", segments: "Tronçons", share: "Part" },
    showing: "Affichage de",
    of: "sur",
    codes: "codes",
    noResult: "Aucun code ne correspond.",
    empty: "Recherchez par code ou signification ci-dessus, ou filtrez par type de code, pour parcourir les 61 codes documentés.",
  },
  showcase: {
    kicker: "Vitrine",
    title: "Où se concentre le réseau de l'époque du plomb.",
    body: "Le fichier brut énumère des années d'installation; il ne peut pas dire quels arrondissements portent les tuyaux les plus anciens. En rattachant 46 923 tronçons de distribution aux arrondissements par le point médian de chaque tronçon, le motif apparaît : Toronto-St. Paul's compte 84,2 % de son réseau de distribution datant d'avant 1955, la part la plus élevée de la ville. Etobicoke-Lakeshore porte le plus de conduites de l'époque du plomb en longueur, avec 206,0 km. La cohorte de l'époque du plomb est composée à 91,6 % de fonte.",
    wardTitle: "Conduites de l'époque du plomb par arrondissement",
    wardSub: "Réseau de distribution installé avant 1955, le seuil municipal de l'époque du plomb. Longueur en km et part du réseau de chaque arrondissement.",
    leadEraKm: "km de l'époque du plomb",
    ofNetwork: "du réseau de l'arrondissement",
    ageTitle: "L'âge du réseau, par décennie",
    ageBody: "Tronçons par décennie de construction. Deux vagues se démarquent : l'expansion d'après-guerre des années 1950 avec 8 339 tronçons, et la vague de remplacement des années 2000-2010 avec 9 772 tronçons combinés. Des tuyaux des années 1870 figurent encore au fichier : 752 tronçons datent d'avant 1880.",
    segments: "tronçons",
    matTitle: "De quoi sont faits les tuyaux de l'époque du plomb",
    matBody: "15 528 des 16 949 tronçons de l'époque du plomb sont en fonte. La classification repose sur l'époque, pas sur une mesure du plomb : aucun tronçon du jeu de données ne porte un code de matériau indiquant explicitement le plomb.",
    hedge: "Ce que cela ne dit pas : il s'agit de conduites principales, les tuyaux de rue, et non de branchements. Le risque lié au plomb à Toronto concerne les branchements, les petits tuyaux qui relient la conduite à la maison. Cet indicateur signale où les branchements de l'époque du plomb sont les plus probables à proximité; il n'affirme jamais qu'un tuyau contient du plomb.",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment le répertoire a été construit, et où il est faible.",
    items: [
      "Source : le paquet de données ouvertes « Watermains » de la Ville de Toronto, récupéré le 2026-10-08. Distribution : 46 923 tronçons, 5 586,4 km. Transport : 2 491 tronçons, 545,2 km. La Ville le met à jour quotidiennement.",
      "Les codes de matériaux sont décodés d'après l'usage standard de l'industrie de l'eau; la source ne publie aucun répertoire, d'où ce projet. Les unités de diamètre sont présumées être des millimètres d'après les tailles standard. Les codes de fonction (0, 1, 2) sont déduits du contexte des fichiers.",
      "Règle du plomb : une année de construction avant 1955 compte comme époque du plomb, d'après la déclaration de la Ville de Toronto selon laquelle les branchements en plomb touchent les maisons construites avant le milieu des années 1950. Cela donne 16 949 tronçons et 2 014,9 km. Aucun tronçon ne porte un code de matériau indiquant explicitement le plomb.",
      "Mesuré contre déduit : le jeu de données mesure l'emplacement, le code de matériau, le diamètre et l'année d'installation. La teneur en plomb n'est jamais mesurée; l'indicateur d'époque est déduit. Les conclusions sanitaires sont hors sujet.",
      "731 tronçons (1,5 %) n'ont pas d'année de construction et ne peuvent être classés par époque. 830 tronçons n'ont aucun matériau enregistré (UNK).",
      "Les arrondissements sont attribués par le point médian de chaque tronçon selon le modèle municipal à 25 arrondissements. Les tronçons hors de tout polygone sont exclus des tables par arrondissement.",
      "Contrôle de la corrosion : la Ville ajoute du phosphate dans ses usines de traitement depuis 2014, ce qui réduit la dissolution du plomb. L'époque décrit l'inventaire des tuyaux enfouis, pas la qualité actuelle de l'eau.",
    ],
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données canoniques. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : watermain_lookup, watermain_lead_risk, watermain_summary.",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "Le répertoire et la classification par tronçon, sous licence MIT, en CSV.",
    files: [
      { name: "watermain_codebook.csv", desc: "61 codes : 18 matériaux, 3 codes de fonction, diamètres, avec significations, chiffres et notes" },
      { name: "lead_classification.csv", desc: "49 414 tronçons avec classification d'époque du plomb, arrondissement et règle appliquée" },
    ],
    download: "Télécharger",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Source des tuyaux : Données ouvertes de la Ville de Toronto (Watermains), Licence du gouvernement ouvert - Toronto. Seuil de l'époque du plomb : Ville de Toronto, Lead & Drinking Water.",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
