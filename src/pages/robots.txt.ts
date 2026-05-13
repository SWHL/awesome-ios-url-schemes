export const prerender = true;

const siteUrl = 'https://swhl.github.io/awesome-ios-url-schemes';

export function GET() {
  return new Response(
    `User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Agent
Allow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: xAI-Bot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Amazonbot
Disallow: /

Sitemap: ${siteUrl}/sitemap.xml
Host: swhl.github.io
`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  );
}
