import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import TitleCard from "../components/TitleCard";

const meta: Meta<typeof TitleCard> = {
  title: "Components/TitleCard",
  component: TitleCard,
  argTypes: {
    title: { control: "text" },
    desc: { control: "text" },
    year: { control: "text" },
    link: { control: "text" },
    variant: {
      control: "select",
      options: ["up", "down", "left", "right"],
    },
    longDivider: { control: "boolean" },
    styles: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TitleCard>;

export const Default: Story = {
  args: {
    title: "Zenfolio Redesign",
    desc: "A full redesign of the Zenfolio platform — bridging design and engineering from Figma to production-ready Next.js.",
    link: "https://danielwijaya.com",
    variant: "up",
    longDivider: false,
  },
};