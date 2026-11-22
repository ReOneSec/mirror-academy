import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirror Academy — Reflect Your Strength!",
  description:
    "Mirror Academy, Berhampore — coaching for WBPSC, WBCS & related exams since 2018. Enquire now or call 9732424300.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirroracademy.in"
  ),
  openGraph: {
    title: "Mirror Academy — Reflect Your Strength!",
    description:
      "Coaching for WBPSC, WBCS & related exams since 2018, Berhampore.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#1B2A4A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
