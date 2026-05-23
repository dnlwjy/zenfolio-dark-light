import type { Preview } from "@storybook/nextjs-vite";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import ThemeProvider from "../context/ThemeProvider";
import ToggleTheme from "../components/ToggleTheme";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    options: {
      storySort: { method: "alphabetical" },
    },
  },

  decorators: [
    (Story) => (
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user">
          <ThemeProvider initialTheme="dark">
            <main id="storybook-root" className="min-h-screen flex items-center justify-center">
              <ToggleTheme styles="fixed top-8 z-50 inset-x-0 mx-auto" />
              <Story />
            </main>
          </ThemeProvider>
        </MotionConfig>
      </LazyMotion>
    ),
  ],
};

export default preview;