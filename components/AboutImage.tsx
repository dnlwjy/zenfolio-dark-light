'use client'

import Image from 'next/image'
import { useTheme } from "@/context/ThemeProvider"
import D from "@/public/me-dark.webp"
import L from "@/public/me-light.webp"
import { m } from "framer-motion";

const AboutImage = () => {
    const { theme } = useTheme()

    return (
        <m.div
            key={theme}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 1, ease: [0.44, 0, 0.56, 1], delay: 0.5 }}
            className="absolute inset-0 select-none"
        >
            <Image
                key={theme}
                src={theme === "dark" ? D : L}
                alt="Picture of Daniel Wijaya"
                fill
                placeholder="blur"
                sizes="(max-width: 680px) 90vw, 680px"
                className="object-cover"
            />
            <div className="absolute -inset-4 bg-[radial-gradient(farthest-side_at_center,transparent_75%,var(--black)_100%)]" />
        </m.div>
    )
}

export default AboutImage;