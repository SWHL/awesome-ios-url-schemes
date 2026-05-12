# Awesome iOS URL Schemes

A static, searchable iOS URL Scheme index built with Astro for GitHub Pages.

## Development

This project uses Astro for static generation and a Python data validator.

```bash
pnpm install
pnpm run validate:data
pnpm run dev
```

Then open the local Astro URL printed by the terminal, usually:

```text
http://localhost:4321
```

If you prefer npm:

```bash
npm install
npm run validate:data
npm run dev
```

Before publishing, update the repository URL in `src/pages/index.astro` if the GitHub repo is not:

```text
https://github.com/SWHL/awesome-ios-url-schemes
```

The data validator can also be run directly:

```bash
python scripts/validate_data.py
```

## Bundle ID lookup

The homepage includes a static Bundle ID lookup tool that works on GitHub Pages. It uses the App Store share URL in the browser and does not require a backend service.

## Data

Scheme records live in `src/data/schemes.json`. Apps are grouped at the top level, and each scheme carries structured metadata:

- `capability`: scenario or action type, such as scan, profile, app search, or payment code
- `regions`: supported or known markets, such as `CN`, `TW`, or `Global`
- `params`: placeholder parameters used by the URL, such as `uid`, `query`, or `url`
- `type`: `scheme`, `universal_link`, or `webview`

Capability labels live in `src/data/capabilities.json`.

Category labels live in `src/data/categories.json`.

Sources collected for later import and attribution live in `src/data/sources.json`.

## Deployment

GitHub Actions builds the Astro site and publishes it to GitHub Pages.
