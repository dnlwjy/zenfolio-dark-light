'use client'

import { useState, useEffect, useMemo } from "react"
import { m, useMotionValue, animate } from "framer-motion"
import { interpolate, toCircle } from "flubber"
import { useTheme } from "@/context/ThemeProvider"

const RAYS: { x1: number; y1: number; x2: number; y2: number; hide: string }[] = [
    { x1: 19, y1: 3, x2: 19, y2: 10, hide: "opacity-0 -translate-y-1.5" },
    { x1: 19, y1: 28, x2: 19, y2: 35, hide: "opacity-0 translate-y-1.5" },
    { x1: 6, y1: 11.5, x2: 11, y2: 14, hide: "opacity-0 -translate-x-1.5 -translate-y-1" },
    { x1: 27, y1: 24, x2: 32, y2: 26.5, hide: "opacity-0 translate-x-1.5 translate-y-1" },
    { x1: 6, y1: 26.5, x2: 11, y2: 24, hide: "opacity-0 -translate-x-1.5 translate-y-1" },
    { x1: 27, y1: 14, x2: 32, y2: 11.5, hide: "opacity-0 translate-x-1.5 -translate-y-1" },
]

// Moon path with translate(7, 7) baked into absolute coordinates
const MOON_PATH = "M28.752 22.002A9.72 9.72 0 0 1 25 22.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 10 18.25C10 23.635 14.365 28 19.75 28a9.753 9.753 0 0 0 9.002-5.998Z"
// Circle params for flubber.toCircle (centered in 38x38 SVG)
const CIRCLE_CENTER_X = 19;
const CIRCLE_CENTER_Y = 19;
const CIRCLE_RADIUS = 5;
const CIRCLE_PATH: string = toCircle(MOON_PATH, CIRCLE_CENTER_X, CIRCLE_CENTER_Y, CIRCLE_RADIUS)(1);

const ToggleTheme = ({
    styles = "",
    size = 38,
    strokeWidth = 1,
    filled = false,
}: {
    styles?: string;
    size?: number;
    strokeWidth?: number;
    filled?: boolean;
}) => {
    const { theme, setTheme } = useTheme()
    const isDark = theme === "dark"
    const progress = useMotionValue(isDark ? 1 : 0)
    const [pathD, setPathD] = useState(() => isDark ? CIRCLE_PATH : MOON_PATH)

    // Memoize morph interpolators for performance
    const [moonToCircle, circleToMoon] = useMemo(() => {
        return [
            interpolate(MOON_PATH, CIRCLE_PATH, { maxSegmentLength: 1.5 }),
            interpolate(CIRCLE_PATH, MOON_PATH, { maxSegmentLength: 1.5 }),
        ];
    }, []);

    // Morphing effect
    useEffect(() => {
        return progress.on("change", (t: number) => {
            if (!isDark) {
                setPathD(circleToMoon(1 - t));
            } else {
                setPathD(moonToCircle(t));
            }
        });
    }, [progress, isDark, moonToCircle, circleToMoon]);

    const handleToggle = () => {
        const next = isDark ? "light" : "dark"
        setTheme(next)
        animate(progress, next === "dark" ? 1 : 0, {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
        })
    }

    // Keyboard shortcut: T for toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Hindari trigger saat user lagi ngetik di input/textarea
            const target = e.target as HTMLElement
            const isTyping =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable

            if (isTyping) return

            if (e.key.toLowerCase() === "t") {
                e.preventDefault()
                handleToggle()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleToggle])

    // Accessibility
    const ariaLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

    return (
        <button
            onClick={handleToggle}
            style={{ width: size, height: size }}
            className={`group flex items-center justify-center cursor-pointer ${styles}`}
            aria-label={ariaLabel}
            aria-pressed={!isDark}
            role="switch"
            tabIndex={0}
        >
            <svg
                className="z-10"
                aria-hidden="true"
                width={size} height={size} viewBox="0 0 38 38"
                fill="none"
            >
                {/* Morphing path: crescent moon → full circle */}
                <m.path
                    d={pathD}
                    fill={filled ? "var(--gray)" : "none"}
                    stroke="var(--gray)"
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    style={{ originX: 0.5, originY: 0.5 }}
                />

                {/* Sun rays */}
                <g stroke="var(--gray)" strokeWidth={strokeWidth} strokeLinecap="round">
                    {RAYS.map(({ x1, y1, x2, y2, hide }, i) => (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                            className={`transition-all duration-500 ${isDark ? "opacity-100 translate-x-0 translate-y-0 delay-400" : hide}`} />
                    ))}
                </g>
            </svg>
            <span className="absolute top-full -mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <p className="text-[10px] text-(--gray) text-center leading-[150%]">
                    {isDark ? "Switch to Light " : "Switch to Dark"}
                    <br />
                    <span>(T)</span>
                </p>
            </span>
        </button>
    )
}

export default ToggleTheme