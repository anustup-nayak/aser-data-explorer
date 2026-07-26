import { ImageResponse } from "next/og";

export const alt =
  "ASER Data Explorer — source-linked rural India learning data from 2012 to 2024";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      justifyContent: "space-between", padding: "72px 80px", background: "#F7F6F2",
      color: "#1C2733", fontFamily: "Arial, sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{
          display: "flex", padding: "12px 20px", borderRadius: 12,
          background: "#2256AC", color: "#FFFFFF", fontSize: 34, fontWeight: 700,
        }}>ASER</div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>Data Explorer</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", maxWidth: 980, fontSize: 64, lineHeight: 1.08, fontWeight: 700 }}>
          Rural India learning data, linked to every source page
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#454F5E" }}>
          Reading · Arithmetic · States · Districts · 2012–2024
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#656E7C" }}>
        <div style={{ display: "flex" }}>aser-data-explorer.vercel.app</div>
        <div style={{ display: "flex" }}>Independent · unofficial · source-linked</div>
      </div>
    </div>,
    size,
  );
}
