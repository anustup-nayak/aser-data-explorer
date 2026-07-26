import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, SOURCE_REPORTS } from "./lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: "ASER Data Explorer",
  authors: [{ name: "Anustup Nayak", url: "https://github.com/anustup-nayak" }],
  creator: "Anustup Nayak",
  category: "education",
  keywords: [
    "ASER data", "Annual Status of Education Report", "India education data",
    "rural India learning outcomes", "foundational literacy", "foundational numeracy",
    "state education comparison", "district education data",
  ],
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "ASER Data Explorer",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "ASER Data Explorer",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en-IN",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#application`,
      name: "ASER Data Explorer",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser with JavaScript",
      isAccessibleForFree: true,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      sameAs: "https://github.com/anustup-nayak/aser-data-explorer",
      about: {
        "@type": "Thing",
        name: "ASER learning outcomes in rural India",
      },
    },
    {
      "@type": "Dataset",
      "@id": `${SITE_URL}/#dataset`,
      name: "ASER Data Explorer public observations",
      url: SITE_URL,
      description:
        "Independent, unofficial, source-linked transcription of published aggregate ASER reading and arithmetic estimates for rural India, states, and 2024 districts.",
      creator: {
        "@type": "Organization",
        name: "ASER Centre / Pratham",
        url: "https://asercentre.org/",
      },
      temporalCoverage: "2012/2024",
      spatialCoverage: { "@type": "Place", name: "Rural India" },
      measurementTechnique:
        "ASER citizen-led household survey; this explorer reproduces published aggregate estimates without interpolation.",
      variableMeasured: [
        { "@type": "PropertyValue", name: "Reading skill", unitText: "percent" },
        { "@type": "PropertyValue", name: "Arithmetic skill", unitText: "percent" },
      ],
      isBasedOn: SOURCE_REPORTS.map(report => report.pdf),
      sameAs: "https://github.com/anustup-nayak/aser-data-explorer",
      dateModified: "2026-07-26",
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
