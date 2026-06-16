'use client'

import Image from 'next/image'
import { useTheme } from "@/context/ThemeProvider"
import D from "@/public/me-dark.webp"
import L from "@/public/me-light.webp"

const AboutImage = () => {
    const { theme } = useTheme()

    return (
        <Image
            src={theme === "dark" ? D : L}
            alt="Picture of Daniel Wijaya"
            fill
            placeholder="blur"
            sizes="(max-width: 680px) 90vw, 680px"
            className="object-cover"
        />
    )
}

export default AboutImage;