import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Grid3x3, Clapperboard, ScanLine, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { trackerLogs } from "@/features/cine/engine";
import { STEP_COUNT, STEP_MS, TOTAL_MS } from "@/features/cine/store";
import { getStyle } from "@/features/cine/styles";
import type { Project } from "@/features/cine/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Deconstructing Real-World Elements", icon: ScanLine },
  { title: "Applying Geometric Grid Patterns", icon: Grid3x3 },
  { title: "Injecting Aesthetic Keyframes", icon: Sparkles },
  { title: "Portraying Cinematic Output", icon: Clapperboard },
];

const AnalysisTracker = ({ project, onComplete }: { project: Project; onComplete: () => void }) => {
  const [now, setNow] = useState(Date.now());
  const done = useRef(false);
  const logs = useMemo(() => trackerLogs(project.breakdown, project.mediaType), [project.breakdown, project.mediaType]);
  const style = getStyle(project.styleId);

  const elapsed = Math.max(0, now - project.startedAt);
  const active = Math.min(STEP_COUNT, Math.floor(elapsed / STEP_MS));
  const pct = Math.min(100, Math.round((elapsed / TOTAL_MS) * 100));

  useEffect(() => {
    done.current = false;
    const t = setInterval(() => setNow(Date.now()), 80);
    return () => clearInterval(t);
  }, [project.startedAt]);

  useEffect(() => {
    if (elapsed >= TOTAL_MS + 350 && !done.current) {
      done.current = true;
      onComplete();
    }
  }, [elapsed, onComplete]);

  const visibleLogs = logs.flatMap((lines, i) => {
    if (i > active) return [];
    if (i < active) return lines.map((l) => ({ step: i, text: l }));
    const within = (elapsed - i * STEP_MS) / STEP_MS;
    return lines.slice(0, Math.max(1, Math.ceil(within * lines.length))).map((l) => ({ step: i, text: l }));
  });

  return (
    <div className="cine-fade-in grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="cine-glass rounded-xl p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Live analysis engine</p>
            <h1 className="mt-2 text-2xl font-semibold">{project.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Target style · {style.name}
            </p>
          </div>
          <span className="font-mono text-3xl font-medium tabular-nums text-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="mb-8 h-1 bg-secondary" />

        <ol className="relative space-y-1">
          {STEPS.map((step, i) => {
            const state = i < active ? "done" : i === active ? "active" : "pending";
            const stepPct = state === "done" ? 100 : state === "active" ? Math.min(100, ((elapsed - i * STEP_MS) / STEP_MS) * 100) : 0;
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px transition-colors duration-500",
                      state === "done" ? "bg-signal/70" : "bg-border",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500",
                    state === "done" && "border-signal/60 bg-signal/10 text-signal cine-glow-signal",
                    state === "active" && "border-primary/70 bg-primary/10 text-primary cine-glow-primary",
                    state === "pending" && "border-border bg-secondary/40 text-muted-foreground",
                  )}
                >
                  {state === "done" ? <Check size={16} /> : <Icon size={16} className={state === "active" ? "cine-pulse" : ""} />}
                </span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className={cn("text-sm font-medium", state === "pending" ? "text-muted-foreground" : "text-foreground")}>
                      {step.title}
                    </p>
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-widest",
                        state === "done" ? "text-signal" : state === "active" ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {state === "done" ? "Complete" : state === "active" ? "Running" : "Queued"}
                    </span>
                  </div>
                  <div className="mt-2 h-0.5 overflow-hidden rounded bg-secondary">
                    <div
                      className={cn("h-full transition-[width] duration-100", state === "done" ? "bg-signal" : "bg-primary")}
                      style={{ width: `${stepPct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="cine-glass flex min-h-[320px] flex-col rounded-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">engine.log</span>
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="cine-pulse h-2 w-2 rounded-full bg-signal" />
          </span>
        </div>
        <div className="flex-1 space-y-1.5 overflow-hidden p-5 font-mono text-xs leading-relaxed">
          {visibleLogs.map((l, idx) => (
            <p key={`${l.step}-${idx}`} className="cine-fade-in text-muted-foreground">
              <span className="text-primary/80">[{String(l.step + 1).padStart(2, "0")}]</span>{" "}
              <span className={idx === visibleLogs.length - 1 && pct < 100 ? "text-foreground" : ""}>{l.text}</span>
            </p>
          ))}
          {pct < 100 && <span className="cine-pulse inline-block h-3.5 w-1.5 translate-y-0.5 bg-primary" />}
        </div>
      </section>
    </div>
  );
};

export default AnalysisTracker;
