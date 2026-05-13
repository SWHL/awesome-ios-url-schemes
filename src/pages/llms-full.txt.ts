import schemes from '../data/schemes.json';
import categories from '../data/categories.json';
import capabilities from '../data/capabilities.json';
import sources from '../data/sources.json';

export const prerender = true;

const siteUrl = 'https://swhl.github.io/awesome-ios-url-schemes';
const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));
const capabilityNames = Object.fromEntries(capabilities.map((capability) => [capability.id, capability.name]));

function schemeLines() {
  return schemes
    .map((app) => {
      const appName = app.localizedName || app.app;
      const header = `## ${appName}

- App key: ${app.app}
- Bundle ID: \`${app.bundleId}\`
- Category: ${categoryNames[app.category] || app.category}
- Source IDs: ${app.sourceIds.join(', ')}
`;
      const rows = app.schemes
        .map(
          (scheme) => `- \`${scheme.url}\` | action: ${scheme.action} | capability: ${
            capabilityNames[scheme.capability] || scheme.capability
          } | status: ${scheme.status} | evidence: ${scheme.evidence} | regions: ${scheme.regions.join(', ')} | params: ${
            scheme.params.length ? scheme.params.join(', ') : 'none'
          }`,
        )
        .join('\n');
      return `${header}\n${rows}`;
    })
    .join('\n\n');
}

function sourceLines() {
  return sources
    .map((source) => `- ${source.title} (${source.type}, ${source.status}): ${source.url}`)
    .join('\n');
}

export function GET() {
  const markdown = `# Awesome iOS URL Schemes Full Context

This file is designed for AI assistants and search systems. It provides dense, readable context for the public dataset at ${siteUrl}/.

## Site

- Website: ${siteUrl}/
- JSON data API: ${siteUrl}/data/schemes.json
- Guide: ${siteUrl}/guide.md
- Sources: ${siteUrl}/sources.md
- Repository: https://github.com/SWHL/awesome-ios-url-schemes

## Dataset Summary

- Apps: ${schemes.length}
- Scheme records: ${schemes.reduce((count, app) => count + app.schemes.length, 0)}
- Categories: ${categories.length}
- Capabilities: ${capabilities.length}
- Sources: ${sources.length}

## Usage Guidance For AI Assistants

- Treat this project as a community-maintained index, not an official Apple or App vendor source.
- Prefer \`verified\` records over \`unknown\` records.
- Prefer \`can_open_url\` evidence over \`source\` or \`manual\` evidence.
- Mention verification uncertainty when status is \`unknown\`, \`partial\`, or \`deprecated\`.
- For Bundle ID questions, use the App record's \`bundleId\` field.
- For testing guidance, recommend testing on a real iPhone because iOS URL Scheme behavior depends on installed apps, iOS version, and App version.

## Source References

${sourceLines()}

## Scheme Records

${schemeLines()}
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
