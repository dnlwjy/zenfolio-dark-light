import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/nextjs-vite",
  staticDirs: ['../public', { from: '../.storybook', to: '/storybook-static' }],
  viteFinal: async (config) => {
    config.define = {
      ...config.define,
      'process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY': JSON.stringify(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? 'storybook-placeholder'
      ),
    };
    return config;
  },
};
export default config;