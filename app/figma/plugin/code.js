const DEFAULT_MANIFEST = {
  meta: { name: "Mashups Figma Seed", version: "1.0.0" },
  pages: [
    {
      name: "01_Brief",
      frames: [
        { name: "Brand Core", width: 960, height: 620 },
        { name: "Messaging", width: 960, height: 620 },
        { name: "Tone", width: 960, height: 500 }
      ]
    },
    {
      name: "02_Moodboard",
      frames: [
        { name: "Visual References", width: 1600, height: 900 },
        { name: "Color Direction", width: 1200, height: 520 },
        { name: "Type References", width: 1200, height: 520 }
      ]
    },
    {
      name: "03_Logo Explorations",
      frames: [
        { name: "Direction A - Wave Monogram", width: 1200, height: 900 },
        { name: "Direction B - Fusion Mark", width: 1200, height: 900 },
        { name: "Direction C - Signal Bolt", width: 1200, height: 900 }
      ]
    }
  ],
  styles: {
    colors: [
      { name: "Brand/primary/500", hex: "#ff4fa3" },
      { name: "Brand/secondary/500", hex: "#ff6f7d" },
      { name: "Brand/accent/500", hex: "#be7dff" },
      { name: "Brand/neutral/bg_dark", hex: "#1c131a" },
      { name: "Brand/neutral/fg_light", hex: "#f5f5f5" }
    ],
    text: [
      { name: "Type/Display/XL", fontFamily: "Inter", fontWeight: 700, fontSize: 64, lineHeight: 72, letterSpacing: -1.2 },
      { name: "Type/Heading/H1", fontFamily: "Inter", fontWeight: 700, fontSize: 40, lineHeight: 48, letterSpacing: -0.6 },
      { name: "Type/Heading/H2", fontFamily: "Inter", fontWeight: 700, fontSize: 32, lineHeight: 40, letterSpacing: -0.4 },
      { name: "Type/Body/M", fontFamily: "Inter", fontWeight: 400, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
      { name: "Type/Label/S", fontFamily: "Inter", fontWeight: 500, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 }
    ]
  }
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "")
  const full = clean.length === 3
    ? clean.split("").map((c) => `${c}${c}`).join("")
    : clean
  const num = parseInt(full, 16)
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  }
}

function ensurePage(name) {
  const existing = figma.root.children.find(
    (child) => child.type === "PAGE" && child.name === name
  )
  if (existing) return existing
  const page = figma.createPage()
  page.name = name
  return page
}

function ensureColorStyle(def) {
  let style = figma.getLocalPaintStyles().find((s) => s.name === def.name)
  if (!style) style = figma.createPaintStyle()
  style.name = def.name
  style.paints = [{ type: "SOLID", color: hexToRgb(def.hex) }]
}

async function ensureTextStyle(def) {
  await figma.loadFontAsync({ family: def.fontFamily, style: "Regular" })
  let style = figma.getLocalTextStyles().find((s) => s.name === def.name)
  if (!style) style = figma.createTextStyle()
  style.name = def.name
  style.fontName = { family: def.fontFamily, style: "Regular" }
  style.fontSize = def.fontSize
  style.lineHeight = { unit: "PIXELS", value: def.lineHeight }
  style.letterSpacing = { unit: "PIXELS", value: def.letterSpacing }
}

function addFrameHeader(frame) {
  const text = figma.createText()
  text.characters = frame.name
  text.x = 24
  text.y = 18
  frame.appendChild(text)
}

async function seed() {
  const manifest = DEFAULT_MANIFEST

  for (const color of manifest.styles.colors) {
    ensureColorStyle(color)
  }
  for (const textStyle of manifest.styles.text) {
    await ensureTextStyle(textStyle)
  }

  let pageOffset = 0
  for (const pageDef of manifest.pages) {
    const page = ensurePage(pageDef.name)
    let x = 0
    const y = pageOffset
    for (const frameDef of pageDef.frames) {
      const frame = figma.createFrame()
      frame.name = frameDef.name
      frame.resize(frameDef.width, frameDef.height)
      frame.x = x
      frame.y = y
      frame.fills = [{ type: "SOLID", color: hexToRgb("#1c131a") }]
      page.appendChild(frame)
      addFrameHeader(frame)
      x += frameDef.width + 64
    }
    pageOffset += 48
  }

  figma.notify("Mashups brand seed created")
  figma.closePlugin()
}

seed()
