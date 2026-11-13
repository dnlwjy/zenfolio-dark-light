import MotionElement from '../../components/MotionElement';
import A from '../../components/A';
import AboutImage from './AboutImage';
import type { Metadata } from "next";
import Divider from '../../components/Divider';
import { client } from '../../sanity/lib/client'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Serializers from '@/lib/Serializers'
import type { About } from '@/types/sanity.types'

// 1. const
const START_DATE = new Date('2020-12-20')
const YEARS_OF_EXPERIENCE = Math.round(
    (Date.now() - START_DATE.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
const DIVIDER = <svg xmlns="http://www.w3.org/2000/svg" className="w-1.75 lg:w-2.25" fill="currentColor" viewBox="-1 -1 7 12"><path stroke="var(--gray)" strokeWidth=".5" d="M.826 9.949H0L3.318.05h.826z" /></svg>
const SUPPORT = "flex flex-col gap-8 max-w-250 items-center mt-8"
const SUPPORT_2 = "flex flex-col gap-4 max-w-280 items-center"
const UNORDERED_LIST_GRID = "grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 md:gap-x-24 gap-x-16 gap-y-8"
const SERIALIZERS_TEXT_CENTER: PortableTextComponents = {
    block: {
        normal: ({ children }) => <p className="text-center mb-0">{children}</p>,
    },
    marks: Serializers.marks,
}

// 2. queries
const query = `*[_type == "about" && _id == "about"][0] {
  heading,
  subheading,
  stacks,
  experiences,
  clients,
  software,
  hardware,
  funFacts,
}`

// 3. metadata
export const metadata: Metadata = {
    title: "About",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        url: "https://danielwijaya.com/about",
    },
}

// 4. render
export default async function About() {
    const about = await client.fetch<About>(query)

    return (
        <>
            <section id="about-me" className="sm">

                <MotionElement variant="up" styles="flex flex-col gap-8 items-center w-full max-w-280">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="btn-text text-(--gray)">About me</span>
                        <h2>{about.heading}</h2>
                    </div>
                    <div className="max-w-240">
                        <PortableText value={about.subheading} components={SERIALIZERS_TEXT_CENTER} />
                    </div>
                </MotionElement>

                <MotionElement variant="up" del={0.5} styles="w-full select-none"><AboutImage /></MotionElement>

                <MotionElement variant="up" del={0.5} styles="flex flex-wrap gap-4 sm:gap-5 justify-center w-full max-w-200">
                    {about.stacks?.map((item, i) => (
                        <div key={item} className="flex items-center gap-4 sm:gap-5">
                            <h3 className="text-[20px] sm:text-[24px]">{item}</h3>
                            {i < (about.stacks?.length ?? 0) - 1 && DIVIDER}
                        </div>
                    ))}
                </MotionElement>
            </section>

            <section id="experience" className="sm pt-0">
                <Divider styles="w-full" />
                <MotionElement variant="up" del={0.5} styles={SUPPORT}>
                    <div className={SUPPORT_2}>
                        <span className="btn-text text-(--gray)">Experience</span>
                        <h2>Over {YEARS_OF_EXPERIENCE} years of experience</h2>
                    </div>
                    <p className="text-center max-w-280">As a fresh graduate living in the post-COVID era, I'm grateful enough to build connections from inside and outside home country. For more details, check out my <A title="LinkedIn page" link="https://www.linkedin.com/in/dnlwjy/" />.</p>
                </MotionElement>

                <MotionElement variant="up" del={0.5} styles="flex flex-col gap-8 sm:gap-4 py-4 w-full">
                    {about.experiences?.map((e) => (
                        <div key={e._key} className="flex sm:flex-row flex-col text-center sm:text-start">
                            <div className="w-full">
                                {e.url ? (
                                    <a href={e.url} className="text-[18px]" target="_blank" rel="noopener noreferrer">
                                        {e.company}
                                    </a>
                                ) : (
                                    <span className="text-[18px] text-(--white)">{e.company}</span>
                                )}
                            </div>
                            <span className="w-full text-[18px]">{e.role}</span>
                            <span className="w-full text-[18px]">{e.year}</span>
                        </div>
                    ))}
                </MotionElement>
            </section>

            <section id="clients" className="sm pt-0">
                <Divider styles="w-full" />
                <MotionElement variant="up" del={0.5} styles={SUPPORT}>
                    <div className={SUPPORT_2}>
                        <span className="btn-text text-(--gray)">Clients</span>
                        <h2>Brands I’ve worked or partnered with...</h2>
                    </div>
                    <p className="text-center max-w-280">I've always loved partnering with amazing brands and companies around the world, and I can't wait to work with many more. If you're one of them, <A title="let's connect" link="/contact" />.</p>
                </MotionElement>

                <MotionElement variant="up" del={0.5} styles="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 w-full justify-items-center">
                    {about.clients?.map((e) => (
                        <div
                            key={e._key}
                            aria-label={e.name}
                            role="img"
                            className="w-36 sm:w-48 aspect-square flex items-center justify-center text-(--white)"
                            dangerouslySetInnerHTML={{ __html: e.svg ?? "" }}
                        />
                    ))}
                </MotionElement>
            </section>

            <section id="uses" className="sm pt-0">
                <Divider styles="w-full" />
                <MotionElement variant="up" del={0.5} styles={SUPPORT}>
                    <div className={SUPPORT_2}>
                        <span className="btn-text text-(--gray)">Uses</span>
                        <h2>My tools and gadgets</h2>
                    </div>
                    <p className="text-center max-w-280">A somewhat comprehensive list of tools, apps, hardware, and more that I use on a daily basis.</p>
                </MotionElement>

                <MotionElement as="ul" variant="up" del={0.5} styles={UNORDERED_LIST_GRID}>
                    {about.software?.map((e) => (
                        <li key={e._key}><A title={e.title} link={e.link} /> — {e.description}</li>
                    ))}
                </MotionElement>

                <MotionElement as="ul" variant="up" del={0.5} styles={UNORDERED_LIST_GRID}>
                    {about.hardware?.map((e) => (
                        <li key={e._key}><A title={e.title} link={e.link} /> — {e.description}</li>
                    ))}
                </MotionElement>

            </section>

            <section id="fun-facts" className="sm pt-0">
                <Divider styles="w-full" />
                <MotionElement variant="up" del={0.5} styles={SUPPORT_2}>
                    <span className="btn-text text-(--gray)">Fun Facts</span>
                    <h2>Things You Might Not Know About Me</h2>
                </MotionElement>

                <MotionElement as="ul" variant="up" del={0.5} styles="flex flex-col gap-12 w-full items-center">
                    {about.funFacts?.map((fact) => (
                        <li key={fact._key} className="flex flex-col gap-2 items-center max-w-225">
                            <span className="text-(--white) text-center">{fact.title}</span>
                            <PortableText value={fact.description} components={SERIALIZERS_TEXT_CENTER} />
                        </li>
                    ))}
                </MotionElement>
            </section>
        </>
    );
}