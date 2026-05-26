import MotionDiv from '../../components/MotionDiv'
import ContactForm from '@/components/ContactForm'
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
    title: "Contact | Daniel Wijaya",
    description: "Have a project in mind? Let's talk — I'm open to freelance, collaboration, and full-time opportunities.",
    url: "/contact",
})

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