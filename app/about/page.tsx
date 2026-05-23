import MotionDiv from '../../components/MotionDiv';
import A from '../../components/A';
import AboutImage from './AboutImage';
import { TOOLS_AND_STACKS, EXPERIENCE } from './siteContent';
import { LOGOS } from './Logos';
import { generateSEO } from '@/lib/seo';
import Divider from '../../components/Divider';

export const metadata = generateSEO({
    title: "About | Daniel Wijaya",
    url: "/about",
})

const START_DATE = new Date('2020-09-19')
const YEARS_OF_EXPERIENCE = Math.round(((Date.now() - START_DATE.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) * 2) / 2
const DIVIDER = <svg xmlns="http://www.w3.org/2000/svg" className="w-1.75 lg:w-2.25" fill="currentColor" viewBox="-1 -1 7 12"><path stroke="var(--gray)" strokeWidth=".5" d="M.826 9.949H0L3.318.05h.826z" /></svg>
const SUPPORT = "flex flex-col gap-8 max-w-320 items-center mt-8"

export default function About() {
    return (
        <main>
            <section id="about-me" className="sm">

                <MotionDiv variant="up" styles="flex flex-col gap-8 max-w-320 items-center">
                    <div className="flex flex-col gap-4 max-w-280 items-center">
                        <span className="btn-text text-(--gray)">About me</span>
                        <h2>I’m Daniel Wijaya, a UX engineer who focuses on design-to-code implementation while maintaining user empathy and scalable business. I specialize in animated and interactive media that actually converts.</h2>
                    </div>
                    <p className="text-center max-w-240">Over the past {YEARS_OF_EXPERIENCE} years, I’ve worked with founders and rising startups around the world as a UX engineer, both remotely and in-office, either independently or as part of small teams. In my spare time, I enjoy playing tennis and walking in nature.</p>
                </MotionDiv>

                <MotionDiv variant="up" del={0.5}><AboutImage /></MotionDiv>

                <MotionDiv variant="up" del={0.5} styles="flex flex-wrap gap-x-40 gap-y-16 w-full justify-center">
                    {TOOLS_AND_STACKS.map((pass) => (
                        <div key={pass.name} className="flex flex-col gap-4 items-center w-100">
                            <span className="btn-text text-(--gray)">{pass.name}</span>
                            <div className="flex flex-wrap gap-4 justify-center">
                                {pass.items.map((e, i) => (
                                    <div key={e.name} className="flex items-center gap-3">
                                        <h3 className="text-[20px]">{e.name}</h3>
                                        {i < pass.items.length - 1 && DIVIDER}
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
                    <p className="text-center max-w-280">Over the past {YEARS_OF_EXPERIENCE} years I’ve had the pleasure to work with companies from various sectors on many interesting projects. For more details, head over to <A title="my LinkedIn" link="https://www.linkedin.com/in/dnlwjy/" />.</p>
                </MotionDiv>

                <MotionDiv variant="up" del={0.5} styles="flex flex-col gap-8 sm:gap-4 py-4 w-full">
                    {EXPERIENCE.map((e) => (
                        <div key={e.company} className="flex sm:flex-row flex-col text-center sm:text-start">
                            <div className="w-full">
                            <a href={e.link} className="text-[18px]" target="_blank" rel="noopener noreferrer">{e.company}</a>
                            </div>
                            <span className="w-full text-[18px]">{e.role}</span>
                            <span className="w-full text-[18px]">{e.period}</span>
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

                <MotionDiv variant="up" del={0.5} styles="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 w-full">
                    {LOGOS.map((Logo, i) => (
                        <div key={i} className="flex items-center justify-center">
                            <Logo styles="w-40 lg:w-48 h-auto text-(--white)" />
                        </div>
                    ))}
                </MotionDiv>
            </section>
        </main>
    );
}