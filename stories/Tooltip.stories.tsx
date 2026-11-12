import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import Tooltip from "../components/Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["normal", "topleft", "topright", "bottomleft", "bottomright"],
    },
    children: {
      control: "text",
    },
    styles: {
      control: "text",
    },
  },
  args: {
    variant: "normal",
    children: "View the full case study, including the project goals, design decisions, and final results.",
    styles: "w-full max-w-[360px]",
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};
