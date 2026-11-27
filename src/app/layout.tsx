import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/siteUrl";

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

// Bengali text (the /bn page, Bengali articles and notices). Geist has no Bengali letters,
// so the browser takes those from this font and everything else from Geist.
const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Mirror Academy, Berhampore | Reflect Your Strength!",
  description:
    "Mirror Academy, Berhampore: coaching for WBCS and WBPSC exams, NEET, JENPAS, JEXPO, WB Police, Agniveer, NET, SET, TET and mock interviews since 2018. Register as a student or call 9732424300.",
  alternates: { canonical: "/" },
  metadataBase: new URL(
    SITE_URL
  ),
  openGraph: {
    title: "Mirror Academy, Berhampore | Reflect Your Strength!",
    description:
      "Coaching for WBPSC, WBCS, medical and engineering entrance, police and teaching exams in Berhampore since 2018.",
    type: "website",
    locale: "en_IN",
    siteName: "Mirror Academy",
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
      className={`${geist.variable} ${geistMono.variable} ${bengali.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
