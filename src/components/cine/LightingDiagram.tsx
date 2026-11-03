import type { CinematicStyle, LightSource } from "@/features/cine/types";

const CX = 180;
const CY = 140;

function pos(l: LightSource) {
  const r = 40 + l.distance * 92;
  const rad = (l.angle * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY + r * Math.cos(rad) };
}

const LightingDiagram = ({ style, activeId }: { style: CinematicStyle; activeId?: string | null }) => (
  <svg viewBox="0 0 360 310" className="w-full" role="img" aria-label="Top-down lighting plot">
    {[50, 95, 135].map((r) => (
      <circle key={r} cx={CX} cy={CY} r={r} fill="none" className="stroke-border" strokeDasharray="2 5" />
    ))}
    <line x1={CX} y1={CY} x2={CX} y2={292} className="stroke-muted-foreground/40" strokeDasharray="3 4" />

    {style.lighting.sources.map((l) => {
      const p = pos(l);
      const dim = activeId && activeId !== l.id;
      return (
        <g key={l.id} opacity={dim ? 0.3 : 1} style={{ transition: "opacity .3s" }}>
          <line x1={p.x} y1={p.y} x2={CX} y2={CY} stroke={l.hex} strokeOpacity={0.55} strokeWidth={1 + l.intensity / 40} strokeDasharray="4 3" />
          <circle cx={p.x} cy={p.y} r={10 + l.intensity / 6} fill={l.hex} fillOpacity={0.14} />
          <circle cx={p.x} cy={p.y} r={7} fill={l.hex} className="stroke-background" strokeWidth="2" />
          <text x={p.x} y={p.y - 16 - l.intensity / 10} textAnchor="middle" fontSize="10" className="fill-foreground font-mono">
            {l.label.toUpperCase()} · {l.intensity}%
          </text>
        </g>
      );
    })}

    <circle cx={CX} cy={CY} r="16" className="fill-secondary stroke-foreground/60" strokeWidth="1.5" />
    <text x={CX} y={CY + 3.5} textAnchor="middle" fontSize="9" className="fill-foreground font-mono">
      TALENT
    </text>

    <g transform={`translate(${CX - 14} 278)`}>
      <rect width="22" height="16" rx="2" className="fill-primary" />
      <path d="M22 4 L30 0 L30 16 L22 12 Z" className="fill-primary" />
    </g>
    <text x={CX + 24} y={292} fontSize="10" className="fill-primary font-mono">
      CAM A
    </text>
  </svg>
);

export default LightingDiagram;
