import "../app/globals.css";
import { useState } from "react";
import Button from '../components/Button'
import { Home } from '../components/IconLibrary'
import ContactForm from '../components/ContactForm'

export default { title: "Components/Button" };

export const AllVariants = {
  render: (args: any) => (
    <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
      <Button title="Primary" variant="primary" {...args} />
      <Button title="Secondary" variant="secondary" {...args} />
      <Button title="Primary" variant="primary" icon={Home} {...args} />
      <Button title="Secondary" variant="secondary" icon={Home} {...args} />
    </div>
  ),
  args: {},
};

export const EventTrigger = {
  render: (args: { defaultTitle: string; activeTitle: string }) => {
    const [active, setActive] = useState(false);
    return (
      <div className="flex flex-col items-center gap-6 p-8">

        <p className="text-center">
          {active ? "An 'event' is triggered!" : "Click me..."}
        </p>

        <Button
          title={active ? args.activeTitle : args.defaultTitle}
          variant="primary"
          additionalHoverLogic={active}
          click={() => setActive((v) => !v)}
        />

      </div>
    );
  },
  argTypes: {
    defaultTitle: { control: "text", name: "Default Title" },
    activeTitle: { control: "text", name: "Active Title" },
  },
  args: {
    defaultTitle: "Send Message",
    activeTitle: "Sending...",
  },
};