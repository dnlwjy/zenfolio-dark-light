import { Metadata } from 'next'
import MotionElement from '../../components/MotionElement'
import ContactForm from '@/components/ContactForm'
import SubInfo from '@/components/SubInfo'
import { client } from '@/sanity/lib/client'
import type { About } from '@/types/sanity.types'
import { IG, LI, Github } from "../../components/IconLibrary";

// 1. const
const socialMedia = [
    { name: "Instagram", link: "https://www.instagram.com/dnlwjy_/", icon: <IG styles="text-(--gray) hover:text-(--white) transition-colors duration-300" /> },
    { name: "LinkedIn", link: "https://www.linkedin.com/in/dnlwjy/", icon: <LI styles="text-(--gray) hover:text-(--white) transition-colors duration-300" /> },
    { name: "GitHub", link: "https://github.com/dnlwjy", icon: <Github styles="text-(--gray) hover:text-(--white) transition-colors duration-300" /> },
]
export const SUPPORT = "flex md:flex-row flex-col min-[1280px]:gap-40 gap-24 w-full"

// 2. queries
const query = `*[_type == "about" && _id == "about"][0] {
    contact,
}`

// 3. metadata
export const metadata: Metadata = {
    title: "Contact",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        url: "https://danielwijaya.com/contact",
    },
}

// 4. render
export default async function Contact() {
    const about = await client.fetch<Pick<About, "contact">>(query)

    return (
        <>
            <section id="contact" className="sm">

                <MotionElement variant="up" styles="flex flex-col gap-4 items-center">
                    <h1>
                        <span className="text-(--gray)">Let’s Work</span>
                        <br />
                        Together
                    </h1>
                </MotionElement>

                <div className={SUPPORT}>
                    <MotionElement as="aside" del={0.5} styles="flex flex-col h-fit md:max-w-90 w-full items-center sm:items-start gap-6 order-2 md:order-1">
                        <dl className="flex flex-col w-full gap-6">
                            {about.contact?.map((e) => (
                                <SubInfo
                                    key={e._key}
                                    title={e.title}
                                    subtitle={e.subtitle}
                                />
                            ))}
                        </dl>

                        <ul className="flex gap-6 items-start pt-2">
                            {socialMedia.map((e) => (
                                <li key={e.name}>
                                    <a
                                        href={e.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-(--white) transition-colors duration-300"
                                        aria-label={e.name}
                                    >
                                        {e.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </MotionElement>

                    <MotionElement as="aside" del={0.7} variant="right" styles="flex flex-col flex-1 gap-16 order-1 md:order-2">
                        <ContactForm styles="w-full" />
                    </MotionElement>
                </div>
            </section>
        </>
    )
}