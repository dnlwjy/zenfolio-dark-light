'use client'

import { m } from 'framer-motion'
import { Home, About, Builds, Contact } from './IconLibrary'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const navItems = [
    { id: "Home", icon: Home, link: "/", left: "8px", key: "Q" },
    { id: "About", icon: About, link: "/about", left: "60px", key: "W" },
    { id: "Builds", icon: Builds, link: "/builds", left: "112px", key: "E" },
    { id: "Contact", icon: Contact, link: "/contact", left: "164px", key: "R" },
]

const Header = ({ styles = "" }: { styles?: string }) => {
    const pathname = usePathname()
    const active = navItems.find((e) =>
        e.link === "/" ? pathname === "/" : pathname.startsWith(e.link)
    )
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement

            const isTyping =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable

            if (isTyping) return
            if (e.repeat) return
            if (e.ctrlKey || e.metaKey || e.altKey) return

            const item = navItems.find(
                (nav) => nav.key.toLowerCase() === e.key.toLowerCase()
            )

            if (!item) return

            e.preventDefault()
            router.push(item.link)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [router])

    return (
        <header className={`flex gap-3 w-fit p-2 rounded-full bg-(--white)/3 border-t border-l border-(--white)/10 backdrop-blur-lg ${styles}`}>

            {/* highlight */}
            {active && (
                <m.div
                    className="absolute bg-(--white) rounded-full h-10 w-10"
                    initial={{ left: active.left, opacity: 0.1 }}
                    animate={{ left: active.left, opacity: 0.1 }}
                />
            )}

            {navItems.map((e) => (
                <Link key={e.id} href={e.link}
                    className="group relative h-10 w-10 flex items-center justify-center">
                    <e.icon styles={`${active?.id === e.id ? "text-(--white)" : "text-(--gray) group-hover:text-(--white)"} transition-colors duration-300`} />
                    <span className="flex items-center absolute top-full mt-2 px-2 h-6.5 bg-(--divider) rounded whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out pointer-events-none select-none">
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-3 h-2 bg-(--divider) [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
                        <p className="text-[12px] text-(--white)">{e.id}<span className="text-[10px] text-(--gray)"> ({e.key})</span></p>
                    </span>
                </Link>
            ))}

        </header>
    )
}

export default Header