// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

import auth from 'auth-astro';

export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: 'always',
  },

  adapter: vercel(),

  prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: false,
  },

  integrations: [sitemap(), auth()],

  site: 'https://www.infolavelada.com/',
})