export const prerender = true;

const siteUrl = 'https://swhl.github.io/awesome-ios-url-schemes';

export function GET() {
  const markdown = `# 使用教程

Awesome iOS URL Schemes 用来查询、复制、验证和提交 iOS URL Scheme。

- Web page: ${siteUrl}/guide/
- Main index: ${siteUrl}/
- Submit a new scheme: https://github.com/SWHL/awesome-ios-url-schemes/issues/new?template=new-scheme.yml

## 1. 查找 Scheme

在首页搜索 App 名称、URL Scheme、Bundle ID、用途、分类或能力。页面支持按 App、按能力、全部列表三种视图。

## 2. 复制并测试

点击每条记录右侧的复制按钮，将 URL Scheme 粘贴到 iPhone Safari、快捷指令、调试工具或 App 内测试入口中打开。

## 3. 反馈可用或失效

验证后点击可用或失效按钮。页面会打开预填好的 GitHub Issue，并携带 App、URL Scheme、用途和机器可解析的反馈 payload。

## 4. 提交新的 Scheme

提交新 Scheme 时建议提供：

- App 名称
- Bundle ID
- URL Scheme
- 用途
- 验证状态
- 证据类型：source、info_plist、can_open_url 或 manual
- 测试环境和来源说明

Issue 创建后，项目会尝试自动生成待审核 PR。
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
