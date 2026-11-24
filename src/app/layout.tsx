import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Geist for everything, Geist Mono for IDs and figures that must line up.
// The same pair the Mirror Academy Admissions Page uses (see DESIGN.md).
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirror Academy, Berhampore | Reflect Your Strength!",
  description:
    "Mirror Academy, Berhampore: coaching for WBPSC, WBCS and related exams since 2018. Register as a student or call 9732424300.",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1d1f" },
  ],
  colorScheme: "light dark",
};

// Applies a theme the visitor picked with the nav's toggle before first paint.
const THEME_SCRIPT = `try{var t=localStorage.getItem('ma-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
