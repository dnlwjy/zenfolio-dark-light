import MotionDiv from '../../../components/MotionDiv'
import SubInfo from '@/components/SubInfo'
import { client } from '../../../sanity/lib/client'
import { PortableText } from "@portabletext/react"
import Serializers from "@/lib/Serializers"
import TitleCard from '../../../components/TitleCard'
import { notFound } from 'next/navigation'
import { listStyles } from '../page'
import { generateSEO } from '@/lib/seo'
import { urlFor } from '../../../sanity/lib/image'
import type { Projects } from '@/types/sanity.types'
import Divider from '@/components/Divider'

// 1. Rendering config: switched to SSG - better performance and SEO, but has to redeploy every time there's data change
export const dynamic = 'force-static'
export async function generateStaticParams() {
    const slugs: string[] = await client.fetch(`*[_type == "projects"].slug.current`)
    return slugs.map((slug) => ({ slug }))
}

// 2. metadata (SEO / head)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const data = await client.fetch(
        `*[_type == "projects" && slug.current == $slug][0]{
        title,
        description,
        coverImage
        }`,
        { slug }
    )
    if (!data) return {}
    return generateSEO({
        title: `${data.title} | Daniel Wijaya`,
        description: data.description ?? "",
        image: data.coverImage ? urlFor(data.coverImage).width(1200).height(630).url() : undefined,
        url: `/case-study/${slug}`,
    })
}

// 3. queries
const query = `*[_type == "projects" && slug.current == $slug][0]{
    _id,
    title,
    role,
    client,
    year,
    website,
    content,
    documentation,
}`

const moreQuery = `*[_type == "projects" && slug.current != $slug]{
    _id,
    title,
    description,
    year,
    slug,
}`

export default async function CaseStudyDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const caseStudy = await client.fetch(query, { slug });
    const moreCaseStudies = await client.fetch(moreQuery, { slug });

    if (!caseStudy) {
        notFound();
    }

    return (
        <main>
            <section id="case-study-brief" className="sm">

                <MotionDiv variant="up" styles="flex flex-col gap-4 items-center">
                    <span className="btn-text text-(--gray)">Case Study</span>
                    <h1>{caseStudy.title}</h1>
                </MotionDiv>

                <div className="flex md:flex-row flex-col md:gap-40 gap-24">
                    <MotionDiv del={0.5} styles="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 h-fit md:max-w-[360px] w-full gap-6">
                        <SubInfo title="Role" subtitle={caseStudy.role} />
                        <SubInfo title="Client" subtitle={caseStudy.client} />
                        <SubInfo title="Year" subtitle={caseStudy.year} />
                        <SubInfo title="Website" subtitle={caseStudy.website ?? "-"} />
                    </MotionDiv>
                    <MotionDiv del={0.7} variant="right" styles="flex-1">
                        <PortableText value={caseStudy.content} components={Serializers} />
                    </MotionDiv>
                </div>
            </section>

            <section id="case-study-documentation" className="sm py-0">
                <MotionDiv variant="up">
                    <PortableText
                        value={caseStudy.documentation}
                        components={Serializers}
                    />
                </MotionDiv>
            </section>

            <Divider styles="pt-40"/>

            <section id="more-case-studies" className="sm pt-40">
                <div className={listStyles}>
                    {moreCaseStudies.map((e: Projects) => (
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
    );
}