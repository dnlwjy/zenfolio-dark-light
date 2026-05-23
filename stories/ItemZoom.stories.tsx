import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import ItemZoom from "../components/ItemZoom";
import { IMAGE } from "../app/builds/page";

const meta: Meta<typeof ItemZoom> = {
  title: "Components/ItemZoom",
  component: ItemZoom,
  argTypes: {
    image: { control: "text" },
    alt: { control: "text" },
    styles: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ItemZoom>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className={`relative ${IMAGE}`}>
        <Story />
      </div>
    ),
  ],
  args: {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    alt: "Sample image",
  },
};