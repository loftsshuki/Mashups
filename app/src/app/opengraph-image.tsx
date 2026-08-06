import { ImageResponse } from "next/og"

export const alt = "Mashups creator campaign studio"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#f2efe5", color: "#13130f", padding: 54, fontFamily: "sans-serif", position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(19,19,15,.08) 1px, transparent 1px)", backgroundSize: "100% 28px" }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", border: "3px solid #13130f", padding: 42, boxShadow: "14px 14px 0 #13130f", background: "#fbf8ef" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ display: "flex", width: 62, height: 62, alignItems: "center", justifyContent: "center", background: "#ff4f1f", border: "2px solid #13130f", color: "#fffaf0", fontSize: 24, fontWeight: 800 }}>M/</div><span style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase" }}>Mashups</span></div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Creator campaign studio</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 84, lineHeight: 0.9, letterSpacing: -6, fontWeight: 900, textTransform: "uppercase" }}>Make the sound<br />they stop for.</span><span style={{ marginTop: 30, fontSize: 25, color: "#625f56" }}>Hooks. Rights proof. Attribution. Measurable lift.</span></div>
        <div style={{ display: "flex", gap: 0, border: "2px solid #13130f" }}>{["TRACK", "CUT", "PROVE", "SHIP", "LEARN"].map((label, index) => <div key={label} style={{ display: "flex", flex: 1, justifyContent: "center", padding: 13, background: index === 3 ? "#d7ff3f" : "#fbf8ef", borderRight: index < 4 ? "2px solid #13130f" : "none", fontSize: 16, fontWeight: 800 }}>{label}</div>)}</div>
      </div>
    </div>,
    size,
  )
}
