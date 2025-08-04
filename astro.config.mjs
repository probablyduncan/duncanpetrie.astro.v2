import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

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

  redirects: {
    "/sancho": "https://sancho.duncanpetrie.com",
  }
});