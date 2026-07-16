import { defineConfig } from 'astro/config';

// Custom domain in use — base stays '/' regardless of repo name,
// since GitHub Pages serves custom domains from the root.
export default defineConfig({
  site: 'https://shreyasramakrishna.dev',
  base: '/',
});
