import fs from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const brandDir = path.join(root, "brand")
const outDir = path.join(root, "figma", "seed")
const outFile = path.join(outDir, "seed-manifest.json")

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8")
  return JSON.parse(raw)
}

function buildColorStyles(tokens) {
  const colors = []
  for (const [groupName, group] of Object.entries(tokens.color)) {
    for (const [tokenName, value] of Object.entries(group)) {
      if (!value || typeof value !== "object" || !("hex" in value)) continue
      colors.push({
        name: `Brand/${groupName}/${tokenName}`,
        hex: value.hex,
      })
    }
  }
  return colors
}

function buildTextStyles(textStylesJson) {
  return (textStylesJson.styles ?? []).map((item) => ({
    name: `Type/${item.name}`,
    fontFamily: item.font_family ?? "Inter",
    fontWeight: item.font_weight ?? 400,
    fontSize: item.font_size ?? 16,
    lineHeight: item.line_height ?? 24,
    letterSpacing: item.letter_spacing ?? 0,
  }))
}

function buildPages() {
  return [
    {
      name: "01_Brief",
      frames: [
        { name: "Brand Core", width: 960, height: 620 },
        { name: "Messaging", width: 960, height: 620 },
        { name: "Tone", width: 960, height: 500 },
      ],
    },
    {
      name: "02_Moodboard",
      frames: [
        { name: "Visual References", width: 1600, height: 900 },
        { name: "Color Direction", width: 1200, height: 520 },
        { name: "Type References", width: 1200, height: 520 },
      ],
    },
    {
      name: "03_Logo Explorations",
      frames: [
        { name: "Direction A - Wave Monogram", width: 1200, height: 900 },
        { name: "Direction B - Fusion Mark", width: 1200, height: 900 },
        { name: "Direction C - Signal Bolt", width: 1200, height: 900 },
      ],
    },
    {
      name: "04_Selection",
      frames: [
        { name: "Top 3 Finalists", width: 1400, height: 900 },
        { name: "Favicon Stress Test", width: 1200, height: 500 },
        { name: "Lockups", width: 1400, height: 600 },
      ],
    },
    {
      name: "05_Brand Kit",
      frames: [
        { name: "Logo Set", width: 1400, height: 820 },
        { name: "Color Tokens", width: 1400, height: 620 },
        { name: "Typography", width: 1400, height: 620 },
        { name: "Usage Rules", width: 1400, height: 620 },
      ],
    },
  ]
}

async function main() {
  const tokens = await readJson(path.join(brandDir, "tokens.json"))
  const textStyles = await readJson(path.join(brandDir, "text-styles.json"))

  const manifest = {
    meta: {
      name: "Mashups Figma Seed",
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
    },
    pages: buildPages(),
    styles: {
      colors: buildColorStyles(tokens),
      text: buildTextStyles(textStyles),
    },
  }

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(outFile, JSON.stringify(manifest, null, 2), "utf8")
  console.log(`Wrote ${path.relative(root, outFile)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
