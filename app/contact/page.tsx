import { Metadata } from 'next'
import MotionDiv from '../../components/MotionDiv'
import ContactForm from '@/components/ContactForm'

// 1. const

// 2. queries

// 3. metadata
export const metadata: Metadata = {
    title: "Contact",
    description: "Have a project in mind? Let's talk — I'm open to freelance, collaboration, and full-time opportunities.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        url: "https://danielwijaya.com/contact",
    },
}

// 4. render
export default function Contact() {

    return (
        <main>
            <section id="contact" className="sm min-h-screen items-center justify-center">
                <MotionDiv
                    variant="up"
                    styles="flex flex-col items-center gap-12 w-full"
                >
                    <h1>
                        <span className="text-(--gray)">Let’s Work</span>
                        <br />
                        Together
                    </h1>
                </MotionDiv>

                <MotionDiv
                    del={0.5}
                    variant="up"
                    styles="flex flex-col gap-12 w-full"
                >
                    <ContactForm styles="w-full" />
                </MotionDiv>
            </section>
        </main>
    )
}