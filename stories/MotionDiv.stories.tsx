import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import MotionDiv from "../components/MotionDiv";

const wrapperStyles = "p-4 md:p-6 bg-(--divider)"

const meta: Meta<typeof MotionDiv> = {
  title: "Components/MotionDiv",
  component: MotionDiv,
  argTypes: {
    variant: {
      control: "select",
      options: ["up", "down", "left", "right"],
    },
    del: {
      control: "select",
      options: [0.3, 0.5, 0.7],
    },
    styles: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MotionDiv>;

const SampleContent = () => (
  <div className={wrapperStyles}>
    <h3>Animated Content</h3>
    <p className="text-(--white) mt-2">This block animates into view.</p>
  </div>
);

export const Left: Story = {
  args: {
    variant: "left",
    children: <SampleContent />,
  },
};

export const Up: Story = {
  args: {
    variant: "up",
    children: <SampleContent />,
  },
};

export const Down: Story = {
  args: {
    variant: "down",
    children: <SampleContent />,
  },
};

export const Right: Story = {
  args: {
    variant: "right",
    children: <SampleContent />,
  },
};

export const AllVariants = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 p-8 w-full max-w-150">
      {(["up", "down", "left", "right"] as const).map((variant) => (
        <MotionDiv key={variant} variant={variant} styles={wrapperStyles}>
            <p className="tag text-mb-1">variant:</p>
            <span className="text-(--white)">({variant})</span>
        </MotionDiv>
      ))}
    </div>
  ),
};
