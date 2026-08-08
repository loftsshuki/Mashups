import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ff4f1f", color: "#13130f", border: "10px solid #13130f", fontSize: 96, fontWeight: 900, letterSpacing: -12, fontFamily: "sans-serif" }}>M<span style={{ color: "#f2efe5" }}>X</span></div>, size)
}
