import { useId } from "react";
import type { CinematicStyle } from "@/features/cine/types";

const W = 400;

const CameraDiagram = ({ style }: { style: CinematicStyle }) => {
  const id = useId().replace(/:/g, "");
  const H = Math.round(W / style.aspectValue);
  const { composition, movement } = style.camera;

  const subject =
    composition === "symmetry"
      ? { x: W / 2, y: H * 0.58 }
      : composition === "leading"
        ? { x: (W * 2) / 3, y: H * 0.55 }
        : composition === "centered-low"
          ? { x: W / 2, y: H * 0.68 }
          : { x: W / 3, y: H * 0.55 };
  const s = Math.min(H * 0.22, 46);

  return (
    <svg viewBox={`-10 -10 ${W + 20} ${H + 44}`} className="w-full" role="img" aria-label={`${style.camera.compositionLabel}, ${style.camera.movementLabel}`}>
      <defs>
        <marker id={`arrow-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-primary" />
        </marker>
      </defs>

      <rect x="0" y="0" width={W} height={H} rx="6" className="fill-background stroke-border" strokeWidth="1.5" />

      {/* composition guides */}
      <g className="stroke-muted-foreground/30" strokeWidth="1" strokeDasharray="3 4">
        {(composition === "thirds" || composition === "leading") && (
          <>
            <line x1={W / 3} y1="0" x2={W / 3} y2={H} />
            <line x1={(W * 2) / 3} y1="0" x2={(W * 2) / 3} y2={H} />
            <line x1="0" y1={H / 3} x2={W} y2={H / 3} />
            <line x1="0" y1={(H * 2) / 3} x2={W} y2={(H * 2) / 3} />
          </>
        )}
        {composition === "symmetry" && (
          <>
            <line x1={W / 2} y1="0" x2={W / 2} y2={H} />
            <line x1="0" y1="0" x2={W / 2} y2={H * 0.45} />
            <line x1={W} y1="0" x2={W / 2} y2={H * 0.45} />
            <line x1="0" y1={H} x2={W / 2} y2={H * 0.45} />
            <line x1={W} y1={H} x2={W / 2} y2={H * 0.45} />
            <rect x={W * 0.3} y={H * 0.25} width={W * 0.4} height={H * 0.5} fill="none" />
          </>
        )}
        {composition === "centered-low" && (
          <>
            <line x1="0" y1={(H * 2) / 3} x2={W} y2={(H * 2) / 3} />
            <line x1={W / 2} y1="0" x2={W / 2} y2={H} />
          </>
        )}
      </g>
      {composition === "leading" && (
        <g className="stroke-signal/50" strokeWidth="1.2">
          <line x1="0" y1={H} x2={subject.x} y2={subject.y} />
          <line x1="0" y1={H * 0.15} x2={subject.x} y2={subject.y} />
          <line x1={W * 0.15} y1={H} x2={subject.x} y2={subject.y} />
        </g>
      )}
      {composition === "centered-low" && <rect x="0" y={(H * 2) / 3} width={W} height={H / 3} className="fill-signal/5" />}

      {/* subject silhouette */}
      <g className="fill-foreground/80">
        <circle cx={subject.x} cy={subject.y - s * 0.75} r={s * 0.28} />
        <path d={`M${subject.x - s * 0.45},${subject.y + s * 0.55} Q${subject.x},${subject.y - s * 0.6} ${subject.x + s * 0.45},${subject.y + s * 0.55} Z`} />
      </g>

      {/* movement path */}
      <g className="stroke-primary" strokeWidth="2" fill="none" markerEnd={`url(#arrow-${id})`}>
        {movement === "tracking" && <path d={`M${W * 0.12},${H - 18} L${W * 0.88},${H - 18}`} />}
        {movement === "whip-pan" && <path d={`M${W * 0.2},${H * 0.16} Q${W / 2},${H * 0.02} ${W * 0.8},${H * 0.16}`} />}
        {movement === "crane" && <path d={`M${W * 0.14},${H - 14} C${W * 0.2},${H * 0.3} ${W * 0.4},${H * 0.15} ${W * 0.62},${H * 0.12}`} />}
      </g>
      {movement === "whip-pan" && (
        <g className="stroke-primary/40" strokeWidth="1">
          {[0.3, 0.4, 0.5, 0.6].map((f) => (
            <line key={f} x1={W * f} y1={H * 0.22} x2={W * (f + 0.06)} y2={H * 0.22} />
          ))}
        </g>
      )}
      {movement === "locked" && (
        <g className="stroke-primary" fill="none" strokeWidth="1.5">
          <rect x={subject.x - s * 1.1} y={subject.y - s * 1.3} width={s * 2.2} height={s * 2.1} strokeDasharray="4 3" />
          <line x1={subject.x - s * 1.6} y1={subject.y - s * 1.8} x2={subject.x - s * 1.15} y2={subject.y - s * 1.35} markerEnd={`url(#arrow-${id})`} />
          <line x1={subject.x + s * 1.6} y1={subject.y + s * 1.25} x2={subject.x + s * 1.15} y2={subject.y + s * 0.85} markerEnd={`url(#arrow-${id})`} />
        </g>
      )}

      <text x="8" y="16" className="fill-muted-foreground font-mono" fontSize="10">
        {style.aspectRatio.toUpperCase()}
      </text>
      <text x={W - 8} y="16" textAnchor="end" className="fill-primary font-mono" fontSize="10">
        {style.camera.lens.toUpperCase()}
      </text>
      <text x="0" y={H + 22} className="fill-muted-foreground font-mono" fontSize="10">
        COMPOSITION · {style.camera.compositionLabel.toUpperCase()}
      </text>
    </svg>
  );
};

export default CameraDiagram;
