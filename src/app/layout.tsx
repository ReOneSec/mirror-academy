import type { Metadata, Viewport } from "next";
import { Anek_Latin } from "next/font/google";
import "./globals.css";

// One family with a width axis: wide for display, normal for reading, narrow for dense labels.
// Anek is by Ek Type, an Indian foundry; Anek Bangla shares its design if a Bengali version follows.
const anek = Anek_Latin({
  variable: "--font-anek",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Mirror Academy, Berhampore | Reflect Your Strength!",
  description:
    "Mirror Academy, Berhampore: coaching for WBPSC, WBCS and related exams since 2018. Send an enquiry or call 9732424300.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirroracademy.in"
  ),
  openGraph: {
    title: "Mirror Academy, Berhampore | Reflect Your Strength!",
    description:
      "Coaching for WBPSC, WBCS and related exams in Berhampore since 2018.",
    type: "website",
    images: ["/brand/logo.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#021b44",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anek.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
