import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://watermains.canada.nshipyard.com"),
  title: "Toronto Watermain Codebook: pipe codes decoded, lead-era classified",
  description:
    "Toronto's 49,414 watermain segments decoded: 18 material codes in plain English, diameters, function codes, and a lead-era classification by ward. Searchable explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
  openGraph: {
    title: "Toronto Watermain Codebook: pipe codes decoded, lead-era classified",
    description:
      "Toronto's 49,414 watermain segments decoded: 18 material codes in plain English, diameters, function codes, and a lead-era classification by ward. Searchable explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
    url: "https://watermains.canada.nshipyard.com",
    siteName: "Toronto Watermain Codebook",
    images: [{ url: "/og-image.png", width: 1200, height: 750, alt: "Toronto Watermain Codebook — pipe codes decoded" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toronto Watermain Codebook: pipe codes decoded, lead-era classified",
    description:
      "Toronto's 49,414 watermain segments decoded: 18 material codes in plain English, diameters, function codes, and a lead-era classification by ward. Searchable explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
