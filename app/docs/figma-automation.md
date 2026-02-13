# Figma Automation Starter
Date: February 13, 2026

## What is included
1. Brand tokens:
- `brand/tokens.json`
- `brand/text-styles.json`
- `brand/effects.json`

2. Seed manifest generator:
- `scripts/generate-figma-seed.mjs`

3. Local Figma plugin scaffold:
- `figma/plugin/manifest.json`
- `figma/plugin/code.js`

## 1) Generate seed manifest (exact command)
From repo root (`app` folder):

```bash
node scripts/generate-figma-seed.mjs
```

Expected output:

```txt
Wrote figma/seed/seed-manifest.json
```

Generated file:
- `figma/seed/seed-manifest.json`

## 2) Load the plugin in Figma (desktop app)
1. Open Figma Desktop.
2. Go to `Plugins` -> `Development` -> `Import plugin from manifest...`
3. Select:
- `figma/plugin/manifest.json`
4. Open any design file.
5. Run:
- `Plugins` -> `Development` -> `Mashups Brand Seeder`

Result:
1. Brand pages are created (Brief, Moodboard, Logo Explorations, etc.).
2. Local color/text styles are created.
3. Frames are scaffolded with starter names and sizes.

## 3) Apply your own generated manifest
Current plugin uses an internal default manifest for reliability.

If you want plugin to read your generated manifest:
1. Open `figma/plugin/code.js`
2. Replace `DEFAULT_MANIFEST` with the JSON from:
- `figma/seed/seed-manifest.json`
3. Re-run plugin from Figma Development menu.

## 4) Recommended immediate workflow
1. Seed file with plugin.
2. Paste the brand brief content from:
- `docs/brand-brief-and-logo-directions.md`
3. Fill moodboard references.
4. Sketch logo directions in black/white first.
5. Run favicon stress test before finalizing.

## 5) Troubleshooting
1. Font load issues:
- Plugin defaults text styles to `Inter` to avoid missing font errors.
2. No pages created:
- Ensure plugin is run in a design file, not FigJam.
3. Stale plugin code:
- Re-import `manifest.json` after editing `code.js`.
