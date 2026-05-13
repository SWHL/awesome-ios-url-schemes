import schemes from '../../data/schemes.json';
import categories from '../../data/categories.json';
import capabilities from '../../data/capabilities.json';

export const prerender = true;

const capabilityNames = Object.fromEntries(capabilities.map((capability) => [capability.id, capability.name]));
const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));
const typeNames: Record<string, string> = {
  scheme: 'Scheme',
  universal_link: 'Universal Link',
  webview: 'WebView',
};
const statusNames: Record<string, string> = {
  verified: '已验证',
  partial: '部分可用',
  deprecated: '可能失效',
  unknown: '未验证',
};
const evidenceNames: Record<string, string> = {
  source: '资料来源',
  info_plist: 'Info.plist',
  can_open_url: 'canOpenURL',
  manual: '人工提交',
};

export function GET() {
  const entries = schemes.flatMap((app) =>
    app.schemes.map((scheme) => {
      const appName = app.localizedName || app.app;
      const capabilityName = capabilityNames[scheme.capability] || scheme.capability;
      const typeName = typeNames[scheme.type] || scheme.type;
      const regions = scheme.regions?.length ? scheme.regions : ['Global'];
      const params = scheme.params?.length ? scheme.params : [];
      const searchText = `${app.app} ${app.localizedName} ${app.bundleId} ${app.category} ${categoryNames[app.category] || ''} ${app.tags.join(
        ' ',
      )} ${scheme.url} ${scheme.action} ${scheme.description} ${capabilityName} ${regions.join(' ')} ${params.join(' ')} ${typeName}`;

      return {
        app: {
          app: app.app,
          localizedName: app.localizedName,
          slug: app.slug,
          bundleId: app.bundleId,
          category: app.category,
          categoryName: categoryNames[app.category] || app.category,
        },
        appName,
        scheme: {
          url: scheme.url,
          action: scheme.action,
          capability: scheme.capability,
          evidence: scheme.evidence,
          status: scheme.status,
          type: scheme.type,
        },
        capabilityName,
        evidenceName: evidenceNames[scheme.evidence] || scheme.evidence,
        statusName: statusNames[scheme.status] || scheme.status,
        regions,
        params,
        searchText,
      };
    }),
  );

  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
