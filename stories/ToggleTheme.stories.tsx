import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { m, useMotionValue, animate } from "framer-motion";
import { interpolate, toCircle } from "flubber";
import ToggleTheme from "../components/ToggleTheme";
import Button from "../components/Button";
import { useTheme } from "../context/ThemeProvider";

const meta: Meta<typeof ToggleTheme> = {
  title: "Components/ToggleTheme",
  component: ToggleTheme,
  argTypes: {
    styles: { control: "text" },
  },
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof ToggleTheme>;

// ─── Playground-only implementation ───────────────────────────────────────────

const RAYS = [
  { x1: 19, y1: 3,    x2: 19, y2: 10,   hide: "opacity-0 -translate-y-1.5" },
  { x1: 19, y1: 28,   x2: 19, y2: 35,   hide: "opacity-0 translate-y-1.5" },
  { x1: 6,  y1: 11.5, x2: 11, y2: 14,   hide: "opacity-0 -translate-x-1.5 -translate-y-1" },
  { x1: 27, y1: 24,   x2: 32, y2: 26.5, hide: "opacity-0 translate-x-1.5 translate-y-1" },
  { x1: 6,  y1: 26.5, x2: 11, y2: 24,   hide: "opacity-0 -translate-x-1.5 translate-y-1" },
  { x1: 27, y1: 14,   x2: 32, y2: 11.5, hide: "opacity-0 translate-x-1.5 -translate-y-1" },
];

const MOON_PATH = "M28.752 22.002A9.72 9.72 0 0 1 25 22.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 10 18.25C10 23.635 14.365 28 19.75 28a9.753 9.753 0 0 0 9.002-5.998Z";
const CIRCLE_PATH: string = toCircle(MOON_PATH, 19, 19, 5)(1);
const moonToCircle = interpolate(MOON_PATH, CIRCLE_PATH, { maxSegmentLength: 1.5 });
const circleToMoon = interpolate(CIRCLE_PATH, MOON_PATH, { maxSegmentLength: 1.5 });

const ToggleThemeCustom = ({
  size = 80,
  strokeWidth = 1,
  filled = false,
}: {
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const progress = useMotionValue(isDark ? 1 : 0);
  const [pathD, setPathD] = useState(() => (isDark ? CIRCLE_PATH : MOON_PATH));

  useEffect(() => {
    return progress.on("change", (t: number) => {
      setPathD(isDark ? moonToCircle(t) : circleToMoon(1 - t));
    });
  }, [progress, isDark]);

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    animate(progress, next === "dark" ? 1 : 0, { duration: 0.5, ease: [0.4, 0, 0.2, 1] });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      if (e.key === " ") { e.preventDefault(); handleToggle(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleToggle]);

  return (
    <button
      onClick={handleToggle}
      style={{ width: size, height: size }}
      className="flex items-center justify-center cursor-pointer"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg className="w-full h-full" viewBox="0 0 38 38" fill="none">
        <m.path
          d={pathD}
          fill={filled ? "var(--gray)" : "none"}
          stroke={filled ? "none" : "var(--gray)"}
          strokeWidth={filled ? 0 : strokeWidth}
          strokeLinejoin="round"
          style={{ originX: 0.5, originY: 0.5 }}
        />
        <g stroke="var(--gray)" strokeWidth={strokeWidth} strokeLinecap="round">
          {RAYS.map(({ x1, y1, x2, y2, hide }, i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              className={`transition-all duration-500 ${isDark ? "opacity-100 translate-x-0 translate-y-0 delay-400" : hide}`} />
          ))}
        </g>
      </svg>
    </button>
  );
};

const Playground = () => {
  const [size, setSize] = useState(300);
  const [strokeWidth, setStrokeWidth] = useState(0.75);
  const [filled, setFilled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative h-full w-full flex flex-col md:block items-center justify-center gap-8 px-4 py-10 md:py-0">

      <div className="flex flex-col gap-4 md:absolute inset-0 items-center justify-center">
        <p>Click below or hit (Space)</p>

        {/* PREVIEW */}
        <div className="relative flex items-center justify-center p-16 border border-(--divider) bg-(--white)/7">
          <div className="flex items-center justify-center aspect-square w-full md:w-90">
            <ToggleThemeCustom size={size} strokeWidth={strokeWidth} filled={filled} />
          </div>
          <span className="absolute bottom-4 tag text-(--gray)">
            {isDark ? "light" : "dark"} mode enabled
          </span>
        </div>
      </div>

      <Button
        title="View on GitHub"
        variant="secondary"
        styles="md:absolute md:right-6 md:top-6"
        click={() => window.open("https://github.com/dnlwjy/flubber-morph-theme-toggle", "_blank", "noopener,noreferrer")}
      />

      {/* Controls */}
      <div className="flex flex-col gap-4 w-full max-w-sm md:absolute md:left-6 md:bottom-6">
        <label className="flex flex-col gap-1">
          <span className="tag text-(--gray)">Size: {size}px</span>
          <input type="range" min={24} max={300} step={4} value={size}
            onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="tag text-(--gray)">Stroke Width: {strokeWidth}</span>
          <input type="range" min={0.25} max={4} step={0.25} value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full" />
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={filled} onChange={(e) => setFilled(e.target.checked)} />
          <span className="tag text-(--gray)">Filled</span>
        </label>
      </div>

    </div>
  );
};

export const PlaygroundStory = {
  name: "Playground",
  render: () => <Playground />,
};