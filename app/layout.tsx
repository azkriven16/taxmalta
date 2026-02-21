import { Footer } from "@/components/footer";
import { NavbarDemo } from "@/components/navbar";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CipTaxPro | Free Malta Tax & Compliance Calculators",
    template: "%s | CipTaxPro",
  },
  description:
    "Get instant, reliable estimates for your Malta personal income tax, rental earnings, late penalties, and audit exemptions. 100% private, in-browser calculations with no sign-in required.",
  keywords: [
    "Malta tax calculator",
    "income tax Malta",
    "audit exemption Malta",
    "rental income tax Malta",
    "Malta tax penalties",
    "notice period calculator Malta",
    "CipTaxPro",
    "TaxMalta",
  ],
  authors: [{ name: "CipTaxPro" }],
  creator: "CipTaxPro",
  openGraph: {
    type: "website",
    locale: "en_MT",
    url: "https://www.ciptaxpro.com",
    title: "CipTaxPro | Instant Malta Tax Calculators",
    description:
      "Stop guessing your taxes. Calculate Malta personal income, rental tax, and compliance obligations instantly and securely in your browser.",
    siteName: "CipTaxPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "CipTaxPro | Free Malta Tax & Compliance Calculators",
    description:
      "Instant, reliable estimates for your Malta tax, audit, and compliance obligations. Try our calculators – no sign-in required.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <NavbarDemo />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
