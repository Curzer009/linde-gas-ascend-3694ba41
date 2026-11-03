import { getStyle } from "./styles";
import type { Project } from "./types";

const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function buildShotListCsv(project: Project): string {
  const b = project.breakdown;
  const style = getStyle(b.styleId);
  const rows: string[][] = [
    ["CineAnalyse Shot List Blueprint"],
    ["Project", project.title],
    ["Style", `${style.name} — ${b.moodName}`],
    ["Aspect ratio", style.aspectRatio],
    ["Lighting ratio", style.lighting.ratio],
    ["Palette", b.palette.map((c) => `${c.name} ${c.hex}`).join(" | ")],
    [],
    ["Shot", "Type", "Lens", "Movement", "Duration", "Lighting", "Palette anchor", "Notes"],
    ...b.shots.map((s) => [s.id, s.type, s.lens, s.movement, s.duration, s.light, s.paletteAnchor, s.note]),
  ];
  return rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export function shotListFilename(project: Project): string {
  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  return `${slug}-shot-list.csv`;
}

export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF", content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
