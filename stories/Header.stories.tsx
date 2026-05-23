import "../app/globals.css";
import type { Meta } from "@storybook/react";
import { useState, useEffect } from "react";
import { Home, About, Builds, Contact } from "../components/IconLibrary";

const navItems = [
  { id: "Home", icon: Home, left: "8px", key: "Q" },
  { id: "About", icon: About, left: "60px", key: "W" },
  { id: "Builds", icon: Builds, left: "112px", key: "E" },
  { id: "Contact", icon: Contact, left: "164px", key: "R" },
];

const Header = () => {
  const [activeId, setActiveId] = useState("Home");
  const active = navItems.find((item) => item.id === activeId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

      const item = navItems.find((nav) => nav.key.toLowerCase() === e.key.toLowerCase());
      if (!item) return;

      e.preventDefault();
      setActiveId(item.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="flex gap-3 w-fit p-2 rounded-full bg-(--white)/3 border-t border-l border-(--white)/10 backdrop-blur-lg relative">
      {active && (
        <div
          className="absolute bg-(--white) rounded-full h-10 w-10 opacity-10 transition-all duration-300"
          style={{ left: active.left }}
        />
      )}
      {navItems.map((item) => (
        <div
          key={item.id}
          onClick={() => setActiveId(item.id)}
          className="group relative h-10 w-10 flex items-center justify-center cursor-pointer"
        >
          <item.icon
            styles={`${
              active?.id === item.id
                ? "text-(--white)"
                : "text-(--gray) group-hover:text-(--white)"
            } transition-colors duration-300`}
          />
          <span className="flex items-center absolute top-full mt-2 px-2 h-6.5 bg-(--divider) rounded whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out pointer-events-none select-none">
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-3 h-2 bg-(--divider) [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <p className="text-[12px] text-(--white)">
              {item.id}
              <span className="text-[10px] text-(--gray)"> ({item.key})</span>
            </p>
          </span>
        </div>
      ))}
    </header>
  );
};

const meta: Meta = {
  title: "Components/Header",
  parameters: { layout: "centered" },
};

export default meta;

export const Default = { render: () => <Header /> };
