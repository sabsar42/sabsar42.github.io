import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
import { education, identity, roles } from "@/lib/content";
import { siteDescription, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap", preload: false });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
  // The hero shows no text, so fonts must not compete with the photo (the LCP element).
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s · ${identity.name}` },
  description: siteDescription,
  applicationName: identity.name,
  authors: [{ name: identity.name, url: siteUrl }],
  creator: identity.name,
  keywords: [
    "Shakib Absar",
    "AI engineer",
    "ML engineer",
    "agentic AI",
    "LangGraph",
    "MCP",
    "RAG",
    "vision-language models",
    "computer vision",
    "medical imaging",
    "founding engineer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: identity.name,
    title: siteTitle,
    description: siteDescription,
    firstName: "Shakib",
    lastName: "Absar",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
  ],
  width: "device-width",
  initialScale: 1,
};

const current = roles[0];

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: identity.name,
  jobTitle: identity.shortTitle,
  description: siteDescription,
  url: siteUrl,
  image: `${siteUrl}/me.jpg`,
  email: `mailto:${identity.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Sylhet", addressCountry: "BD" },
  worksFor: { "@type": "Organization", name: current.org },
  alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
  knowsAbout: identity.interests,
  sameAs: Object.values(identity.links),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        {/* Enables reveal-on-scroll styles only when JS runs, so no-JS visitors see everything. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-(--r-sm) focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
