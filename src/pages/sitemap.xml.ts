export const prerender = true;

const siteUrl = 'https://swhl.github.io/awesome-ios-url-schemes';
const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/index.md', priority: '0.9', changefreq: 'weekly' },
  { path: '/llms.txt', priority: '0.9', changefreq: 'weekly' },
  { path: '/llms-full.txt', priority: '0.8', changefreq: 'weekly' },
  { path: '/guide/', priority: '0.7', changefreq: 'monthly' },
  { path: '/guide.md', priority: '0.6', changefreq: 'monthly' },
  { path: '/sources/', priority: '0.6', changefreq: 'monthly' },
  { path: '/sources.md', priority: '0.5', changefreq: 'monthly' },
  { path: '/data/schemes.json', priority: '0.8', changefreq: 'weekly' },
];

export function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const absoluteUrl = (path: string) => new URL(path.replace(/^\//, ''), `${siteUrl}/`);
  const urls = routes
    .map(
      (route) => `<url>
  <loc>${absoluteUrl(route.path)}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>${route.changefreq}</changefreq>
  <priority>${route.priority}</priority>
</url>`,
    )
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
