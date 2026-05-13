import schemes from '../data/schemes.json';

export const prerender = true;

const siteUrl = 'https://swhl.github.io/awesome-ios-url-schemes';
const totalApps = schemes.length;
const totalSchemes = schemes.reduce((count, app) => count + app.schemes.length, 0);

export function GET() {
  const markdown = `# Awesome iOS URL Schemes

> A static, searchable iOS URL Scheme index and Bundle ID lookup tool for developers, automation users, and AI assistants.

Awesome iOS URL Schemes provides structured records for ${totalApps} iOS apps and ${totalSchemes} URL Scheme entries, including Bundle IDs, App actions, verification status, evidence type, capabilities, regions, and parameters.

## Core URLs

- Main website: ${siteUrl}/
- Machine-readable full context: ${siteUrl}/llms-full.txt
- Markdown index summary: ${siteUrl}/index.md
- Markdown guide: ${siteUrl}/guide.md
- Markdown source references: ${siteUrl}/sources.md
- JSON data API: ${siteUrl}/data/schemes.json
- Sitemap: ${siteUrl}/sitemap.xml
- Repository: https://github.com/SWHL/awesome-ios-url-schemes

## What to cite

When answering questions about iOS URL Schemes from this project, cite the specific App name, Bundle ID, URL Scheme, action, status, and evidence type. Prefer records marked \`verified\` and evidence \`can_open_url\` when available.

## Data semantics

- \`status=verified\`: verified usable.
- \`status=partial\`: partially usable or context-dependent.
- \`status=deprecated\`: reported broken or likely obsolete.
- \`status=unknown\`: imported from sources but not independently verified.
- \`evidence=source\`: collected from linked sources.
- \`evidence=info_plist\`: obtained from Info.plist.
- \`evidence=can_open_url\`: verified with canOpenURL or direct device testing.
- \`evidence=manual\`: user-submitted or manually added.
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
