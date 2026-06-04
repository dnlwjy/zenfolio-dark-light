import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'
import { envPublic } from '@/lib/env.public'
import "./globals.css";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion"
import Header from '../components/Header'
import Footer from '../components/Footer'
import ToggleTheme from '@/components/ToggleTheme'
import ThemeProvider from "@/context/ThemeProvider"
import { client } from '../sanity/lib/client'
import type { About } from "@/types/sanity.types"

// 1. const
const SITE_NAME = "Daniel Wijaya"
const SITE_TITLE = `${SITE_NAME} | UX Engineer`
const TEMPLATE = `%s | ${SITE_NAME}`
const FALLBACK_SITE_DESCRIPTION = "I’m Daniel Wijaya, a UX engineer specializing in bridging design and code through user-centered thinking while building scalable and maintainable systems. I live at the intersection of user empathy and systems."

// 2. queries
const query = `*[_type == "about" && _id == "about"][0] {
  heading,
}`

// 3. metadata
export async function generateMetadata(): Promise<Metadata> {
  const siteDesc = await client.fetch<Pick<About, "heading">>(query)
    .catch(() => ({ heading: FALLBACK_SITE_DESCRIPTION }))

  return {
    metadataBase: new URL("https://danielwijaya.com"),
    title: { default: SITE_TITLE, template: TEMPLATE },
    description: siteDesc?.heading ?? FALLBACK_SITE_DESCRIPTION,
    alternates: { canonical: "/" },
    icons: { icon: "/favicon.png" },
    openGraph: {
      type: "website",
      url: "https://danielwijaya.com",
      siteName: SITE_NAME,
      images: ["/og-default.jpg"],
    },
    twitter: {
      card: "summary_large_image",
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
      </head>
      <body>
        <ThemeProvider>
          <LazyMotion features={domAnimation} strict>
            <MotionConfig
              transition={{ type: "spring", stiffness: 500, damping: 50 }}
            >
              <Header styles="fixed top-6 inset-x-0 mx-auto z-50" />
              <ToggleTheme styles="fixed top-8 right-8 z-50 sm:flex hidden" />
              {children}
              <Footer />
            </MotionConfig>
          </LazyMotion>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={envPublic.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    </html>
  );
}