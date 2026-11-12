import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ConsentProvider from "../context/ConsentProvider";
import CookieBanner from "../components/CookieBanner";

const meta: Meta<typeof CookieBanner> = {
  title: "Components/CookieBanner",
  component: CookieBanner,
  parameters: { layout: "fullscreen" },
  args: { styles: "w-full max-w-[360px]" },
  decorators: [
    (Story) => {
      if (typeof document !== "undefined") {
        document.cookie = "consent_v1=; Path=/; Max-Age=0";
      }

      return (
        <ConsentProvider>
          <Story />
        </ConsentProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof CookieBanner>;

export const Default: Story = {};
