import type { Metadata } from "next";
import { envPublic } from '@/lib/env.public'
import "./globals.css";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion"
import Header from '../components/Header'
import Footer from '../components/Footer'
import ToggleTheme from '@/components/ToggleTheme'
import ThemeProvider from "@/context/ThemeProvider"
import ConsentProvider from "@/context/ConsentProvider"
import { client } from '../sanity/lib/client'
import type { About } from "@/types/sanity.types"
import Chatbot from "@/components/Chatbot";
import CookieBanner from "@/components/CookieBanner";
import AnalyticsConsentGate from "@/components/AnalyticsConsentGate";
import { chatConfig } from '@/lib/config/chat'

// 1. const
const SITE_NAME = "Daniel Wijaya"
const JOB_TITLE = "Frontend Engineer"
const SITE_TITLE = `${SITE_NAME} | ${JOB_TITLE}`
const TEMPLATE = `%s | ${SITE_NAME}`
const FALLBACK_SITE_DESCRIPTION = "I’m Daniel Wijaya, a Frontend engineer specializing in bridging design and code through user-centered thinking while building scalable and maintainable systems."
const SITE_URL = "https://danielwijaya.com"
const JSONLD = {
  '@context': 'https://schema.org',
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: SITE_NAME,
      url: SITE_URL,
      jobTitle: JOB_TITLE,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

// 2. queries
const query = `*[_type == "about" && _id == "about"][0] {
  heading,
}`

// 3. metadata
export async function generateMetadata(): Promise<Metadata> {
  const siteDesc = await client.fetch<Pick<About, "heading">>(query)
    .catch(() => ({ heading: FALLBACK_SITE_DESCRIPTION }))

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_TITLE, template: TEMPLATE },
    description: siteDesc?.heading ?? FALLBACK_SITE_DESCRIPTION,
    icons: { icon: "/favicon.png" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: siteDesc?.heading ?? FALLBACK_SITE_DESCRIPTION,
      images: [
        {
          url: "/og-default.jpg",
          width: 1200,
          height: 630,
          alt: SITE_TITLE,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: siteDesc?.heading ?? FALLBACK_SITE_DESCRIPTION,
      images: ["/og-default.jpg"],
    },
  }
}

// 4. render
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Saved theme to head to avoid flickering (sync) */}
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t)}catch(e){}`
        }} />

        {/* Global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(JSONLD).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body>
        <ConsentProvider>
          <ThemeProvider>
            <LazyMotion features={domAnimation} strict>
              <MotionConfig
                transition={{ type: "spring", stiffness: 500, damping: 50 }}
              >
                <Header styles="fixed top-6 inset-x-0 mx-auto z-50" />
                <ToggleTheme styles="fixed top-8 right-8 z-50 sm:flex hidden" />
                <Chatbot
                  styles="fixed lg:bottom-8 lg:right-8 bottom-5 right-5 z-50"
                  recaptchaSiteKey={envPublic.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}
                  recaptchaAction={chatConfig.recaptcha.action}
                />
                <main>
                  {children}
                </main>
                <Footer />
              </MotionConfig>
            </LazyMotion>
          </ThemeProvider>
          <CookieBanner styles="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-[360px]"/>
          <AnalyticsConsentGate gaId={envPublic.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </ConsentProvider>
      </body>
    </html>
  );
}