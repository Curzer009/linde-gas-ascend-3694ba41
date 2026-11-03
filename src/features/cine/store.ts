import { useSyncExternalStore } from "react";
import { analyzeScene, type AnalysisInput } from "./engine";
import { getStyle } from "./styles";
import type { Project, StyleId } from "./types";

export const STEP_MS = 1800;
export const STEP_COUNT = 4;
export const TOTAL_MS = STEP_MS * STEP_COUNT;

const KEY = "cineanalyse.projects.v1";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function seed(): Project[] {
  const now = Date.now();
  const hour = 3600_000;
  const inputs: (AnalysisInput & { ago: number })[] = [
    {
      title: "Night Shift at Kofi's Diner",
      mediaType: "script",
      styleId: "neo-noir",
      moodIndex: 0,
      ago: 2 * hour,
      source: {
        script:
          "INT. DINER — NIGHT. Rain hammers the windows. A tired waitress wipes the counter under a buzzing fluorescent tube while a lone stranger in a wet coat sits silent at the far booth, stirring cold coffee. The neon OPEN sign outside flickers.",
      },
    },
    {
      title: "Morning Commute — Platform 4",
      mediaType: "video",
      styleId: "anderson",
      moodIndex: 0,
      ago: 26 * hour,
      source: { fileName: "platform4_commuters_raw.mov", fileSize: 184_320_000, fileType: "video/quicktime", duration: 42, width: 1920, height: 1080 },
    },
    {
      title: "Interrogation Room Rehearsal",
      mediaType: "video",
      styleId: "fincher",
      moodIndex: 1,
      ago: 3 * 24 * hour,
      source: { fileName: "int_room_suspect_take3.mp4", fileSize: 92_600_000, fileType: "video/mp4", duration: 118, width: 3840, height: 2160 },
    },
    {
      title: "Harvest Festival Reunion",
      mediaType: "script",
      styleId: "golden-hour",
      moodIndex: 0,
      ago: 6 * 24 * hour,
      source: {
        script:
          "EXT. FARM FIELD — SUNSET. Families gather between the hay bales as the festival winds down. Ama spots her brother walking up the dirt road after ten years away. They run to each other, laughing, as the whole village turns to watch.",
      },
    },
  ];
  return inputs.map(({ ago, ...input }) => ({
    ...input,
    id: newId(),
    createdAt: now - ago,
    startedAt: now - ago,
    status: "complete" as const,
    breakdown: analyzeScene(input),
  }));
}

function load(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    /* fall through to seed */
  }
  const seeded = seed();
  try {
    localStorage.setItem(KEY, JSON.stringify(seeded));
  } catch {
    /* storage unavailable */
  }
  return seeded;
}

let projects: Project[] | null = null;
const listeners = new Set<() => void>();

function current(): Project[] {
  if (!projects) projects = load();
  return projects;
}

function commit(next: Project[]) {
  projects = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or unavailable — keep in memory */
  }
  listeners.forEach((l) => l());
}

export function useProjects(): Project[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    current,
    current,
  );
}

export function isProcessing(p: Project, now = Date.now()): boolean {
  return p.status === "processing" && now - p.startedAt < TOTAL_MS;
}

export function createProject(input: Omit<AnalysisInput, "moodIndex">): Project {
  const now = Date.now();
  const full = { ...input, moodIndex: 0 };
  const project: Project = { ...full, id: newId(), createdAt: now, startedAt: now, status: "processing", breakdown: analyzeScene(full) };
  commit([project, ...current()]);
  return project;
}

export function completeProject(id: string) {
  commit(current().map((p) => (p.id === id && p.status !== "complete" ? { ...p, status: "complete" } : p)));
}

/** Same style → next mood variant; new style → that style's first mood. */
export function nextMoodIndex(p: Pick<Project, "styleId" | "moodIndex">, styleId: StyleId): number {
  if (styleId !== p.styleId) return 0;
  return (p.moodIndex + 1) % getStyle(styleId).moods.length;
}

export function regenerateProject(id: string, styleId: StyleId) {
  commit(
    current().map((p) => {
      if (p.id !== id) return p;
      const moodIndex = nextMoodIndex(p, styleId);
      return {
        ...p,
        styleId,
        moodIndex,
        status: "processing",
        startedAt: Date.now(),
        breakdown: analyzeScene({ title: p.title, mediaType: p.mediaType, source: p.source, styleId, moodIndex }),
      };
    }),
  );
}

export function deleteProject(id: string) {
  commit(current().filter((p) => p.id !== id));
}
