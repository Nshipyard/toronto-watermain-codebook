import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";
import { PosthogProvider } from "../components/PosthogProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://watermains.canada.nshipyard.com"),
  title: "Toronto Watermain Codebook: pipe codes decoded, lead-era classified",
  description:
    "Toronto's 49,414 watermain segments decoded: 18 material codes in plain English, diameters, function codes, and a lead-era classification by ward. Searchable explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      "/favicon.ico",
    ],
    apple: "/apple-touch-icon.png",
  },
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col"><PosthogProvider>
        <LangProvider>{children}</LangProvider>
      </PosthogProvider></body>
    </html>
  );
}
