import { useEffect, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Clapperboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CineLayout = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = "CineAnalyse — Cinematic Scene Analysis";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="cine cine-backdrop min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/cine" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Clapperboard size={15} />
            </span>
            <span className="font-semibold tracking-tight">CineAnalyse</span>
            <span className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              v2.4
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/cine"
              end
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              Projects
            </NavLink>
            <Button asChild size="sm" className="ml-1 gap-1.5">
              <Link to="/cine/new">
                <Plus size={14} /> New analysis
              </Link>
            </Button>
          </nav>

          <div className="hidden items-center gap-2 font-mono text-[11px] text-muted-foreground md:flex">
            <span className="cine-pulse h-1.5 w-1.5 rounded-full bg-signal" />
            ENGINE ONLINE
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
};

export default CineLayout;
