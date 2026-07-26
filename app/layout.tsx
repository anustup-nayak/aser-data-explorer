import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASER Data Explorer",
  description: "Explore approved ASER assessment data with source-linked comparisons.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
