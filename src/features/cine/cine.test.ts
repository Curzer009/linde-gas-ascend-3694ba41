import { describe, it, expect } from "vitest";
import { validateScript, validateTitle, validateVideoFile, MAX_VIDEO_BYTES } from "./validation";
import { analyzeScene, detectScene } from "./engine";
import { buildShotListCsv } from "./exportCsv";
import { nextMoodIndex } from "./store";
import type { Project } from "./types";

describe("CineAnalyse validation", () => {
  it("requires a title", () => {
    expect(validateTitle("   ")).not.toBeNull();
    expect(validateTitle("Night shift")).toBeNull();
  });

  it("rejects scripts shorter than 40 characters", () => {
    expect(validateScript("Too short.")).not.toBeNull();
    expect(validateScript("A".repeat(40))).toBeNull();
  });

  it("only accepts video formats up to 500 MB", () => {
    expect(validateVideoFile({ name: "notes.pdf", type: "application/pdf", size: 1000 })).not.toBeNull();
    expect(validateVideoFile({ name: "take.mp4", type: "video/mp4", size: MAX_VIDEO_BYTES + 1 })).not.toBeNull();
    expect(validateVideoFile({ name: "take.mov", type: "", size: 1000 })).toBeNull();
  });
});

describe("CineAnalyse engine", () => {
  it("detects night interior from a script", () => {
    const d = detectScene("INT. DINER — NIGHT. A waitress wipes the counter.");
    expect(d.setting).toBe("interior");
    expect(d.timeOfDay).toBe("night");
    expect(d.location).toBe("the diner");
  });

  it("uses the chosen style's palette and aspect ratio", () => {
    const b = analyzeScene({ title: "T", mediaType: "script", source: { script: "x".repeat(50) }, styleId: "anderson", moodIndex: 0 });
    expect(b.palette[0].hex).toBe("#F4B6C2");
    expect(b.metrics.find((m) => m.label === "Aspect ratio")?.cinematic).toBe("1.37:1 Academy");
  });

  it("regenerating the same style moves to the next mood; a new style starts at its first", () => {
    expect(nextMoodIndex({ styleId: "fincher", moodIndex: 0 }, "fincher")).toBe(1);
    expect(nextMoodIndex({ styleId: "fincher", moodIndex: 1 }, "fincher")).toBe(0);
    expect(nextMoodIndex({ styleId: "fincher", moodIndex: 1 }, "neo-noir")).toBe(0);
  });

  it("exports one CSV row per shot with quoted commas", () => {
    const input = { title: 'Diner, "night"', mediaType: "script" as const, source: { script: "INT. DINER — NIGHT. ".repeat(4) }, styleId: "neo-noir" as const, moodIndex: 0 };
    const project: Project = { ...input, id: "1", createdAt: 0, startedAt: 0, status: "complete", breakdown: analyzeScene(input) };
    const csv = buildShotListCsv(project);
    expect(csv).toContain('"Diner, ""night"""');
    const shotRows = csv.split("\r\n").filter((l) => /^\d{2}A,/.test(l));
    expect(shotRows).toHaveLength(6);
  });
});
