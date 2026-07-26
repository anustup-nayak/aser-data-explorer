/**
 * Per-card exports: CSV of the exact rows shown, and a self-contained PNG
 * "image card" (question, chart, values, source attribution) sized for
 * documents and slide decks. Drawn with the Canvas API — no dependencies.
 */

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const cell = (v: string | number) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const body = [header.join(","), ...rows.map(r => r.map(cell).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  trigger(url, filename);
}

export type CardSeries = { label: string; value: number; highlight?: boolean };
export type CardLine = { label: string; points: { x: string; y: number }[]; dashed?: boolean };
export type ImageCardSpec = {
  title: string;            // the question, verbatim
  subtitle: string;         // population / construct line
  kind: "bars" | "lines" | "ladder";
  bars?: CardSeries[];
  lines?: CardLine[];
  ladder?: { label: string; value: number; color: string }[];
  note?: string;            // caveat printed above the source line
  source: string;           // e.g. "ASER 2024 report, p. 69 — asercentre.org"
};

const INK = "#1C2733", INK2 = "#4A5566", INK3 = "#8A93A1", PAPER = "#FBFAF7",
  ACCENT = "#C77C1A", BLUE = "#2F6BC6", GRID = "#E8E6DF";

export function downloadImageCard(filename: string, spec: ImageCardSpec) {
  const W = 1200, PAD = 56;
  // Every row is drawn. Silently cutting a 38-district card to 16 would make
  // the image disagree with the table and CSV beside it.
  const barRows = spec.kind === "bars" ? (spec.bars?.length ?? 0) : 0;
  const bodyH = spec.kind === "bars" ? barRows * 44 + 40 : spec.kind === "lines" ? 420 : 220;
  const noteH = spec.note ? 54 : 0;
  const H = 170 + bodyH + noteH + 86;
  const canvas = document.createElement("canvas");
  const scale = 2; // retina-crisp for decks
  canvas.width = W * scale; canvas.height = H * scale;
  const g = canvas.getContext("2d")!;
  g.scale(scale, scale);

  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.fillStyle = ACCENT; g.fillRect(0, 0, W, 6);

  const wrap = (text: string, x: number, y: number, maxW: number, lh: number, font: string, color: string): number => {
    g.font = font; g.fillStyle = color;
    let line = "", yy = y;
    for (const word of text.split(" ")) {
      const probe = line ? line + " " + word : word;
      if (g.measureText(probe).width > maxW && line) { g.fillText(line, x, yy); line = word; yy += lh; }
      else line = probe;
    }
    if (line) g.fillText(line, x, yy);
    return yy + lh;
  };

  let y = wrap(spec.title, PAD, 64, W - 2 * PAD, 40, "600 30px Georgia, serif", INK);
  y = wrap(spec.subtitle, PAD, y + 2, W - 2 * PAD, 24, "15px system-ui, sans-serif", INK2) + 14;

  if (spec.kind === "bars" && spec.bars) {
    const rows = spec.bars;
    const max = Math.max(...rows.map(r => r.value), 1);
    const labelW = 250, valueW = 80, trackW = W - 2 * PAD - labelW - valueW;
    for (const r of rows) {
      g.font = `${r.highlight ? "700 " : ""}15px system-ui, sans-serif`;
      g.fillStyle = r.highlight ? INK : INK2;
      g.fillText(r.label.length > 30 ? r.label.slice(0, 29) + "…" : r.label, PAD, y + 16);
      g.fillStyle = GRID; g.fillRect(PAD + labelW, y + 2, trackW, 18);
      g.fillStyle = r.highlight ? ACCENT : BLUE;
      g.fillRect(PAD + labelW, y + 2, Math.max(4, (r.value / max) * trackW), 18);
      g.font = "600 15px system-ui, sans-serif"; g.fillStyle = INK;
      g.fillText(`${r.value.toFixed(1)}%`, PAD + labelW + trackW + 14, y + 16);
      y += 44;
    }
    y += 20;
  }

  if (spec.kind === "lines" && spec.lines?.length) {
    const chartX = PAD + 40, chartW = W - 2 * PAD - 220, chartH = 320, top = y + 10;
    const xs = spec.lines[0].points.map(p => p.x);
    const all = spec.lines.flatMap(l => l.points.map(p => p.y));
    const lo = Math.max(0, Math.floor(Math.min(...all) / 10) * 10 - 10);
    const hi = Math.min(100, Math.ceil(Math.max(...all) / 10) * 10 + 10);
    const px = (i: number) => chartX + (xs.length < 2 ? 0 : (i * chartW) / (xs.length - 1));
    const py = (v: number) => top + ((hi - v) * chartH) / (hi - lo || 1);
    g.strokeStyle = GRID; g.fillStyle = INK3; g.font = "13px system-ui, sans-serif";
    for (const gv of [lo, (lo + hi) / 2, hi]) {
      g.beginPath(); g.moveTo(chartX, py(gv)); g.lineTo(chartX + chartW, py(gv)); g.stroke();
      g.fillText(String(gv), chartX - 34, py(gv) + 4);
    }
    xs.forEach((x, i) => { g.fillStyle = INK3; g.fillText(x, px(i) - 14, top + chartH + 26); });
    spec.lines.forEach((l, li) => {
      g.strokeStyle = li === 0 ? BLUE : INK3; g.lineWidth = 3;
      g.setLineDash(l.dashed ? [8, 6] : []);
      g.beginPath();
      l.points.forEach((p, i) => {
        const x = px(i), yy = py(p.y);
        if (i) g.lineTo(x, yy);
        else g.moveTo(x, yy);
      });
      g.stroke(); g.setLineDash([]);
      l.points.forEach((p, i) => {
        g.fillStyle = li === 0 ? BLUE : INK3;
        g.beginPath(); g.arc(px(i), py(p.y), 5, 0, Math.PI * 2); g.fill();
        g.font = "600 12px system-ui, sans-serif";
        g.fillText(p.y.toFixed(1), px(i) - 13, py(p.y) + (li === 0 ? -10 : 19));
      });
      const last = l.points[l.points.length - 1];
      g.font = "600 15px system-ui, sans-serif"; g.fillStyle = li === 0 ? INK : INK2;
      g.fillText(`${l.label} ${last.y.toFixed(1)}%`, chartX + chartW + 14, py(last.y) + 5);
    });
    y = top + chartH + 46;
  }

  if (spec.kind === "ladder" && spec.ladder) {
    const trackW = W - 2 * PAD, top = y + 14, hgt = 64;
    let x = PAD;
    for (const seg of spec.ladder) {
      const w = Math.max(3, (seg.value / 100) * trackW - 3);
      g.fillStyle = seg.color; g.fillRect(x, top, w, hgt);
      if (w > 52) {
        g.font = "600 16px system-ui, sans-serif"; g.fillStyle = "#fff";
        g.fillText(`${seg.value.toFixed(1)}`, x + 10, top + 38);
      }
      x += w + 3;
    }
    let lx = PAD, ly = top + hgt + 34;
    g.font = "14px system-ui, sans-serif";
    for (const seg of spec.ladder) {
      g.fillStyle = seg.color; g.fillRect(lx, ly - 12, 14, 14);
      g.fillStyle = INK2;
      const t = `${seg.label} ${seg.value.toFixed(1)}%`;
      g.fillText(t, lx + 20, ly);
      lx += g.measureText(t).width + 46;
      if (lx > W - 220) { lx = PAD; ly += 26; }
    }
    y = ly + 28;
  }

  if (spec.note) y = wrap(spec.note, PAD, y + 8, W - 2 * PAD, 22, "italic 14px Georgia, serif", INK2);
  g.strokeStyle = GRID; g.beginPath(); g.moveTo(PAD, H - 58); g.lineTo(W - PAD, H - 58); g.stroke();
  g.font = "14px system-ui, sans-serif"; g.fillStyle = INK3;
  g.fillText(`Source: ${spec.source}`, PAD, H - 32);
  g.font = "600 14px Georgia, serif"; g.fillStyle = INK2;
  const brand = "ASER Data Explorer · independent, source-linked";
  g.fillText(brand, W - PAD - g.measureText(brand).width, H - 32);

  canvas.toBlob(blob => { if (blob) trigger(URL.createObjectURL(blob), filename); }, "image/png");
}

function trigger(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
