import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { LINKS } from './src/lib/linkHelper';

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
    "/sancho": LINKS.sancho,
    "/pizza": LINKS.pizza,
    "/wiki": LINKS.wiki,
    "/spider": LINKS.spider,
    "/v1": "https://v1.duncanpetrie.com",
    "/v2": "https://v2.duncanpetrie.com",
    "/v3": "https://v3.duncanpetrie.com",
    "/v4": "https://v4.duncanpetrie.com",
    "/v5": "https://v5.duncanpetrie.com",
    "/v6": "https://v6.duncanpetrie.com",
  }
});