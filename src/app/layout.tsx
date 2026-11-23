import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans-face",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
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
    images: ["/brand/logo.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#021b44",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
