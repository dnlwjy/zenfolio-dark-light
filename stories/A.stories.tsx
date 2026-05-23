import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import A from "../components/A";

const meta: Meta<typeof A> = {
  title: "Components/Text Link",
  component: A,
  argTypes: {
    title: { control: "text" },
    link: { control: "text" },
    styles: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof A>;

export const Default: Story = {
  args: {
    title: "Visit my website",
    link: "https://danielwijaya.com",
  },
  render: (args) => (
    <div className="flex flex-wrap justify-center gap-8 p-8">
      <A {...args} />
    </div>
  ),
};

export const DummyParagraph: Story = {
  args: {
    title: "Storybook",
    link: "https://storybook.js.org",
  },
  render: (args) => (
    <p className="p-8 max-w-160">
      This is a design system consisting of reusable components, design tokens, and documentation to improve consistency.
      By documenting everything in <A {...args} />, everything becomes visible to the entire team making it easier to spot any flaws or to suggest improvements without technical knowledge.
    </p>
  ),
};