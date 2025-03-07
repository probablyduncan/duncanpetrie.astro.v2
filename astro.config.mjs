import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  site: 'https://duncanpetrie.com/',

  prefetch: {
    prefetchAll: true
  },

  experimental: {
    contentIntellisense: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});