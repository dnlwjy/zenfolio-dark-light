import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import Divider from "../components/Divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  argTypes: {
    variant: {
      control: "select",
      options: ["left", "right"],
    },
    title: { control: "text" },
    styles: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Left: Story = {
  args: {
    variant: "left",
  },
};

export const Right: Story = {
  args: {
    variant: "right",
  },
};

export const WithCaption: Story = {
  args: {
    variant: "left",
    title: "Section Title",
    styles: "w-fit",
  },
};