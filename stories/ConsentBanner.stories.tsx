import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import ConsentProvider from "../context/ConsentProvider";
import ConsentBanner from "../components/ConsentBanner";

const meta: Meta<typeof ConsentBanner> = {
  title: "Components/ConsentBanner",
  component: ConsentBanner,
  parameters: { layout: "fullscreen" },
  decorators: [
    // Bersihkan cookie consent dulu agar setiap story mulai dari kondisi "belum memilih".
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
type Story = StoryObj<typeof ConsentBanner>;

function consentCookieValue(): string {
  const row = document.cookie.split("; ").find((entry) => entry.startsWith("consent_v1="));
  expect(row).toBeDefined();
  return decodeURIComponent(row!.slice("consent_v1=".length));
}

export const NecessaryOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Banner muncul untuk pengunjung baru.
    expect(await canvas.findByRole("dialog", { name: "Cookie consent" })).toBeTruthy();

    await userEvent.click(canvas.getByRole("button", { name: "Necessary" }));

    // Banner tertutup dan pilihan tersimpan di cookie.
    expect(canvas.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
    expect(consentCookieValue()).toContain('"analytics":false');
  },
};

export const AcceptAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole("dialog", { name: "Cookie consent" })).toBeTruthy();

    await userEvent.click(canvas.getByRole("button", { name: "Accept" }));

    expect(canvas.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
    expect(consentCookieValue()).toContain('"analytics":true');
  },
};

export const Customize: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole("button", { name: "Customize" }));

    // Toggle analytics muncul; simpan tanpa mengaktifkan apa pun.
    const checkbox = canvas.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await userEvent.click(canvas.getByRole("button", { name: "Save choices" }));

    expect(consentCookieValue()).toContain('"analytics":false');
  },
};
