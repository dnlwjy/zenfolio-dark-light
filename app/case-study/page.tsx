import MotionDiv from '../../components/MotionDiv'
import { client } from '../../sanity/lib/client'
import TitleCard from '../../components/TitleCard'
import type { Projects } from '@/types/sanity.types'
import { Metadata } from 'next'

// 1. const
export const listStyles = "flex flex-col gap-20 w-full"
const SUPPORT = "Archive of client-based projects from 2023 onward."

// 2. queries
const query = `*[_type == "projects"] | order(year desc, orderRank asc) {
    _id,
    title,
    description,
    year,
    slug,
}`

// 3. metadata
export const metadata: Metadata = {
    title: "Case Study",
    description: SUPPORT,
    alternates: {
        canonical: "/case-study",
    },
    openGraph: {
        url: "https://danielwijaya.com/case-study",
    },
}

// 4. render
export default async function CaseStudies() {
    const caseStudies = await client.fetch(query)

    return (
        <main>
            <section className="sm">

                <MotionDiv variant="up" styles="flex flex-col gap-6 items-center w-full">
                    <h1>
                        <span className="text-(--gray)">Archive of</span>
                        <br />
                        Case Studies
                    </h1>
                    <p className="text-center">{SUPPORT}</p>
                </MotionDiv>

                <div className={listStyles}>
                    {caseStudies.map((e: Projects) => (
                        <TitleCard
                            key={e._id}
                            title={e.title}
                            desc={e.description}
                            year={e.year}
                            link={`/case-study/${e.slug!.current}`}
                            longDivider
                            styles="w-full"
                        />
                    ))}
                </div>

            </section>
        </main>
    )
}