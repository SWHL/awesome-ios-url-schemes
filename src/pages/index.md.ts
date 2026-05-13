import schemes from '../data/schemes.json';
import categories from '../data/categories.json';
import capabilities from '../data/capabilities.json';

export const prerender = true;

const siteUrl = 'https://swhl.github.io/awesome-ios-url-schemes';
const totalApps = schemes.length;
const totalSchemes = schemes.reduce((count, app) => count + app.schemes.length, 0);
const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));
const capabilityNames = Object.fromEntries(capabilities.map((capability) => [capability.id, capability.name]));

function topApps() {
  return schemes
    .map((app) => ({
      name: app.localizedName || app.app,
      bundleId: app.bundleId,
      category: categoryNames[app.category] || app.category,
      count: app.schemes.length,
      examples: app.schemes.slice(0, 4),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 24);
}

export function GET() {
  const appList = topApps()
    .map(
      (app) => `## ${app.name}

- Bundle ID: \`${app.bundleId}\`
- Category: ${app.category}
- Scheme count: ${app.count}
- Example schemes:
${app.examples.map((scheme) => `  - \`${scheme.url}\`: ${scheme.action} (${capabilityNames[scheme.capability] || scheme.capability})`).join('\n')}
`,
    )
    .join('\n');

  const markdown = `# Awesome iOS URL Schemes

Awesome iOS URL Schemes is a static, searchable index for iOS URL Schemes, Universal Links, App actions, Bundle IDs, verification status, and source evidence.

- Website: ${siteUrl}/
- Data API: ${siteUrl}/data/schemes.json
- Guide: ${siteUrl}/guide/
- Sources: ${siteUrl}/sources/
- Repository: https://github.com/SWHL/awesome-ios-url-schemes
- Apps indexed: ${totalApps}
- Scheme records: ${totalSchemes}

## What this site provides

- Search iOS URL Scheme records by App name, Bundle ID, URL, action, category, capability, status, and evidence.
- Query an App Store share URL to get the iOS Bundle ID on a static GitHub Pages site.
- Copy URL Schemes for testing in Safari, Shortcuts, or development tools.
- Submit new schemes and report working or broken schemes through GitHub Issues.

## Data fields

- \`appName\`: App display name.
- \`bundleId\`: iOS Bundle ID.
- \`scheme.url\`: URL Scheme or related deep link.
- \`scheme.action\`: Human-readable action.
- \`scheme.capability\`: Normalized capability such as open-app, scan, payment-code, profile, app-search, open-url, settings, or navigation.
- \`scheme.status\`: verified, partial, deprecated, or unknown.
- \`scheme.evidence\`: source, info_plist, can_open_url, or manual.
- \`regions\`: Known regions such as CN, Global, TW, or HK.

## High-density App Examples

${appList}
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
