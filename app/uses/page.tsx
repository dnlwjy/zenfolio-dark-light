import MotionDiv from '../../components/MotionDiv';
import { client } from '@/sanity/lib/client';
import { PortableText } from "@portabletext/react"
import Serializers from "@/lib/Serializers"
import { Metadata } from 'next'
import type { Uses } from '@/types/sanity.types'

// 1. const
const SUPPORT = "A somewhat list of tools, books, software, etc that I use."

// 2. queries
const query = `*[_type == "uses"] | order(orderRank asc) {
    _id,
    title,
    content,
}`

// 3. metadata
export const metadata: Metadata = {
    title: "Uses",
    description: SUPPORT
}

// 4. render
export default async function Uses() {
    const uses = await client.fetch<Uses[]>(query)

    return (
        <main>
            <section id="uses" className="sm">

                <MotionDiv
                    variant="up"
                    styles="flex flex-col gap-4 max-w-200 items-center"
                >
                    <h1>Uses</h1>
                    <p className="text-center">{SUPPORT}</p>
                </MotionDiv>

                <MotionDiv variant="up" del={0.5} styles="flex flex-col gap-0 w-full">
                    {uses.map((e) => (
                        <div key={e._id} className="flex flex-col sm:flex-row pt-16 pb-10 px-0 gap-4 justify-center w-full border-t border-(--divider)">
                            <span className="btn-text w-full sm:max-w-100">{e.title}</span>
                            <div className="w-full sm:max-w-100">
                                {e.content?.length ? (
                                    <PortableText value={e.content} components={Serializers} />
                                ) : <p>TBA</p>}
                            </div>
                        </div>
                    ))}
                </MotionDiv>

            </section>
        </main>
    );
}