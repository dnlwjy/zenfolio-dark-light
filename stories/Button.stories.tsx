import "../app/globals.css";
import { useState } from "react";
import Button from '../components/Button'
import { Home, Builds, About, Contact, Preview, IG, LI, Github, Spotify, Search, Close } from '../components/IconLibrary'

const iconMap = {
  Home,
  Builds,
  About,
  Contact,
  Preview,
  IG,
  LI,
  Github,
  Spotify,
  Search,
  Close,
};

export default { title: "Components/Button" };

export const Default = {
  render: (args: any) => {
    const selectedIcon = args.icon ? iconMap[args.icon as keyof typeof iconMap] : null;
    const { icon, ...restArgs } = args;
    return <Button title={args.title} variant={args.variant} icon={selectedIcon} {...restArgs} />;
  },
  argTypes: {
    title: { control: "text", name: "Title" },
    variant: { control: "select", options: ["primary", "secondary", "disabled"], name: "Variant" },
    icon: { control: "select", options: [null, "Home", "Builds", "About", "Contact", "Preview", "IG", "LI", "Github", "Spotify", "Search", "Close"], name: "Icon" },
  },
  args: {
    title: "Button",
    variant: "primary",
    icon: "Home",
  },
};

export const AllVariants = {
  render: (args: any) => (
    <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
      <Button title="Primary" variant="primary" {...args} />
      <Button title="Secondary" variant="secondary" {...args} />
      <Button title="Disabled" variant="disabled" {...args} />
      <Button title="Primary" variant="primary" icon={Home} {...args} />
      <Button title="Secondary" variant="secondary" icon={Home} {...args} />
      <Button title="Disabled" variant="disabled" icon={Home} {...args} />
    </div>
  ),
  args: {},
};

export const EventTrigger = {
  render: (args: { defaultTitle: string; activeTitle: string }) => {
    const [active, setActive] = useState(false);
    return (
      <div className="flex flex-col items-center gap-6 relative">

        <Button
          title={active ? args.activeTitle : args.defaultTitle}
          variant="primary"
          additionalHoverLogic={active}
          click={() => setActive((v) => !v)}
          styles="w-[216px]"
        />

        <span className="tag text-center absolute top-full mt-4">
          {active ? "An 'event' is triggered!" : ""}
        </span>

      </div>
    );
  },
  argTypes: {
    defaultTitle: { control: "text", name: "Default Title" },
    activeTitle: { control: "text", name: "Active Title" },
  },
  args: {
    defaultTitle: "Click Me",
    activeTitle: "Sending...",
  },
};