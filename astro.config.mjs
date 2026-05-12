import { defineConfig } from 'astro/config';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && repository ? `/${repository}` : '/';

export default defineConfig({
  site: 'https://swhl.github.io/awesome-ios-url-schemes',
  base,
  output: 'static',
});
