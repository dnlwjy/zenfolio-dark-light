import MotionDiv from '../../components/MotionDiv'
import { client } from '../../sanity/lib/client'
import { generateSEO } from '@/lib/seo'
import type { Shop } from '@/types/sanity.types'
import ItemZoom from "@/components/ItemZoom"
import Image from 'next/image'
import { urlFor } from "@/sanity/lib/image"
import Divider from '../../components/Divider'
import LinkButton from '@/components/LinkButton'

// 1. Rendering config: switched to SSG - better performance and SEO, but has to redeploy every time there's data change
export const dynamic = 'force-static'

// 2. metadata (SEO / head)
const description = "Things I've Built in the past"
export const metadata = generateSEO({
    title: "Builds | Daniel Wijaya",
    description,
    url: "/builds",
})

// 3. queries
const query = `*[_type == "shop"] | order(year desc, orderRank asc) {
    _id,
    title,
    description,
    coverImage,
    year,
    preview,
    marketplaceURL,
    slug,
    featured,
}`

const TITLECARD = "flex flex-col gap-8 z-10 flex-1 min-w-80"
export const IMAGE = "flex items-center justify-center border border-(--divider) bg-(--white)/7 aspect-square lg:h-60 h-50"
const LINKBUTTONS = "flex flex-wrap items-center sm:gap-x-5 gap-x-4 gap-y-2"

export default async function Builds() {
    const builds = await client.fetch(query)
    const featured = builds.find((e: Shop) => e.featured) as Shop
    const nonFeatured: Shop[] = builds.filter((e: Shop) => !e.featured)

    return (
        <main>
            <section className="md:flex-row flex-col md:items-start items-center lg:gap-24 md:gap-16 gap-0 max-w-520 md:p-0 sm:px-12 px-6">

                {/* NON FEATURED */}
                <MotionDiv styles="flex flex-col flex-1 gap-0 max-w-240 w-full lg:py-32 py-24 md:pl-32 pl-0 md:order-1 order-2">
                    <span className="btn-text text-(--gray) sm:flex hidden">{description}</span>

                    {nonFeatured.map((e) => (
                        <div key={e._id} className="flex flex-col gap-4 pb-8 sm:items-center items-start">

                            <Divider styles="w-full mb-4" title={e.year} />
                            <div className="flex flex-wrap items-center gap-8 w-full">

                                {/* IMAGE */}
                                <div className={IMAGE}>
                                    <div className="w-[80%] aspect-square relative">
                                        <Image
                                            src={urlFor(e.coverImage!).format("webp").url()}
                                            alt={e.title ?? ""}
                                            fill
                                            sizes="(max-width: 680px) 35vw, (max-width: 1080px) 25vw, 350px"
                                            className="object-contain filter-[drop-shadow(0px_20px_16px_rgba(0,0,0,0.35))]"
                                        />
                                    </div>
                                </div>

                                {/* TITLE CARD */}
                                <div className={TITLECARD}>
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-start">{e.title}</h3>
                                        <p className="line-clamp-3">{e.description}</p>
                                    </div>

                                    <div className={LINKBUTTONS}>
                                        <LinkButton title="Preview" link={e.preview} />
                                        {e.marketplaceURL && (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.25" fill="currentColor" viewBox="-1 -1 7 12"><path stroke="var(--gray)" strokeWidth=".5" d="M.826 9.949H0L3.318.05h.826z" /></svg>
                                                <LinkButton
                                                    title="View Listing"
                                                    link={e.marketplaceURL}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* SKELETON PLACEHOLDERS */}
                    {[0, 1, 2].map((i) => (
                        <div key={`skeleton-${i}`} className="flex flex-col gap-4 pb-8 sm:items-center items-start">
                            <Divider styles="w-full mb-4" title="Coming Soon" />

                            <div className="flex flex-wrap items-center gap-8 w-full">
                                {/* IMAGE SKELETON */}
                                <div className={IMAGE}>
                                    <div className="w-[80%] aspect-square bg-(--divider) rounded-sm" />
                                </div>

                                {/* TITLE CARD SKELETON */}
                                <div className={TITLECARD}>
                                    <div className="flex flex-col gap-4">
                                        <div className="h-7 bg-(--divider) rounded-sm w-3/4" />
                                        <div className="flex flex-col gap-2">
                                            <div className="h-4 bg-(--divider) rounded-sm w-full" />
                                            <div className="h-4 bg-(--divider) rounded-sm w-5/6" />
                                            <div className="h-4 bg-(--divider) rounded-sm w-4/6" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="h-4 bg-(--divider) rounded-sm w-16" />
                                        <div className="h-4 bg-(--divider) rounded-sm w-36" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </MotionDiv>

                {/* FEATURED CARD */}
                <MotionDiv variant="right" del={0.5} styles="flex flex-col gap-6 flex-1 w-full lg:max-w-none max-w-[680px] lg:pt-30 lg:pb-20 md:pb-6 md:pr-32 pr-0 pt-16 md:h-screen md:sticky top-0 md:order-2 order-1">
                    <span className="btn-text text-(--gray) flex sm:hidden">{description}</span>

                    <div className="h-full w-full justify-center items-center border border-(--divider) bg-(--white)/7 flex flex-col">
                        <ItemZoom
                            styles="w-full h-full"
                            image={featured.coverImage ? urlFor(featured.coverImage).format("webp").url() : ""}
                            alt={featured.title ?? ""}
                        />
                        <div className="flex flex-col gap-8 z-10 w-full lg:p-12 md:p-9 pt-0! sm:p-12 p-5">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 items-center h-1.25 w-full justify-between"><Divider /><span className="tag">{featured.year}</span></div>
                                <h2 className="text-start">{featured.title}</h2>
                                <p className="line-clamp-4">{featured.description}</p>
                            </div>

                            <div className={LINKBUTTONS}>
                                <LinkButton title="Preview" link={featured.preview} />
                                {featured.marketplaceURL && (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-2.25" fill="currentColor" viewBox="-1 -1 7 12"><path stroke="var(--gray)" strokeWidth=".5" d="M.826 9.949H0L3.318.05h.826z" /></svg>
                                        <LinkButton
                                            title="View Listing"
                                            link={featured.marketplaceURL}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </MotionDiv>

            </section>
        </main>
    )
}