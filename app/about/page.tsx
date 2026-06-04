import MotionDiv from '../../components/MotionDiv';
import A from '../../components/A';
import AboutImage from './AboutImage';
import type { Metadata } from "next";
import Divider from '../../components/Divider';
import { client } from '../../sanity/lib/client'
import type { About } from '@/types/sanity.types'

// 1. const
const START_DATE = new Date('2020-12-20')
const YEARS_OF_EXPERIENCE = Math.round(
    (Date.now() - START_DATE.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
const START_UX_ENGINEER = new Date('2024-02-20')
const YEARS_OF_UX_ENGINEER_EXPERIENCE = Math.round(
  (Date.now() - START_UX_ENGINEER.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
const DIVIDER = <svg xmlns="http://www.w3.org/2000/svg" className="w-1.75 lg:w-2.25" fill="currentColor" viewBox="-1 -1 7 12"><path stroke="var(--gray)" strokeWidth=".5" d="M.826 9.949H0L3.318.05h.826z" /></svg>
const SUPPORT = "flex flex-col gap-8 max-w-320 items-center mt-8"

// 2. queries
const query = `*[_type == "about" && _id == "about"][0] {
  heading,
  skills,
  experiences,
  clients,
}`

// 3. metadata
export const metadata: Metadata = {
  title: "About",
}

// 4. render
export default async function About() {
    const about = await client.fetch<About>(query)

    return (
        <main>
            <section id="about-me" className="sm">

                <MotionDiv variant="up" styles="flex flex-col gap-8 items-center w-full max-w-280">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="btn-text text-(--gray)">About me</span>
                        <h2>{about.heading}</h2>
                    </div>
                    <p className="text-center max-w-240">Over the past {YEARS_OF_EXPERIENCE} years, I’ve been working with companies and agencies around the world as a designer and web developer. In the last {YEARS_OF_UX_ENGINEER_EXPERIENCE} years, I've pivoted into UX engineering bridging the gap between design and code. In my spare time, I make <A title="new-age music" link="https://www.youtube.com/@danielwijaya" /> and enjoy playing tennis.</p>
                </MotionDiv>

                <MotionDiv variant="up" del={0.5} styles="w-full"><AboutImage /></MotionDiv>

                <MotionDiv variant="up" del={0.5} styles="flex flex-wrap gap-x-40 gap-y-16 w-full justify-center">
                    {about.skills?.map((e) => (
                        <div key={e._key} className="flex flex-col gap-4 items-center w-100">
                            <span className="btn-text text-(--gray)">
                                {e.category === "tools" ? "Tools" : "Stacks"}
                            </span>

                            <div className="flex flex-wrap gap-4 justify-center">
                                {e.items?.map((item, i) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <h3 className="text-[20px]">{item}</h3>
                                        {i < (e.items?.length ?? 0) - 1 && DIVIDER}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </MotionDiv>
            </section>

            <section id="experience" className="sm py-0">
                <Divider styles="w-full" />
                <MotionDiv variant="up" del={0.5} styles={SUPPORT}>
                    <div className="flex flex-col gap-4 max-w-280 items-center">
                        <span className="btn-text text-(--gray)">Experience</span>
                        <h2>Over {YEARS_OF_EXPERIENCE} years of experience</h2>
                    </div>
                    <p className="text-center max-w-280">Over the past {YEARS_OF_EXPERIENCE} years I’ve had the pleasure to work with companies from various sectors on many interesting projects. For more details, head over to my <A title="LinkedIn Profile" link="https://www.linkedin.com/in/dnlwjy/" />.</p>
                </MotionDiv>

                <MotionDiv variant="up" del={0.5} styles="flex flex-col gap-8 sm:gap-4 py-4 w-full">
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
                </MotionDiv>
            </section>

            <section id="clients" className="sm pt-32">
                <Divider styles="w-full" />
                <MotionDiv variant="up" del={0.5} styles={SUPPORT}>
                    <div className="flex flex-col gap-4 max-w-280 items-center">
                        <span className="btn-text text-(--gray)">Clients</span>
                        <h2>Brands I’ve worked or partnered with...</h2>
                    </div>
                    <p className="text-center max-w-280">I’ve been lucky enough to establish relationships with amazing clients from all over the world, ranging from individual clients, through up-and-coming startups, to multinational companies.</p>
                </MotionDiv>

                <MotionDiv variant="up" del={0.5} styles="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 w-full justify-items-center">
                    {about.clients?.map((e) => (
                        <div
                            key={e._key}
                            aria-label={e.name}
                            role="img"
                            className="w-40 lg:w-48 aspect-square flex items-center justify-center text-(--white)"
                            dangerouslySetInnerHTML={{ __html: e.svg ?? "" }}
                        />
                    ))}
                </MotionDiv>
            </section>
        </main>
    );
}