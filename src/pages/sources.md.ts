import sources from '../data/sources.json';

export const prerender = true;

const siteUrl = 'https://swhl.github.io/awesome-ios-url-schemes';

export function GET() {
  const sourceList = sources
    .map(
      (source) => `## ${source.title}

- ID: \`${source.id}\`
- Type: ${source.type}
- Status: ${source.status}
- URL: ${source.url}
`,
    )
    .join('\n');

  const markdown = `# 参考来源

This page lists source references used by Awesome iOS URL Schemes.

- Web page: ${siteUrl}/sources/
- Main index: ${siteUrl}/
- Data API: ${siteUrl}/data/schemes.json

${sourceList}
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
