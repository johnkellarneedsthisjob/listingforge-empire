import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ListingForge - AI Product Listing Generator",
  description: "Generate high-converting product titles, descriptions, and SEO tags for Print-on-Demand stores in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
