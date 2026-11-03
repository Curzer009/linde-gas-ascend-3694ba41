import { getStyle } from "./styles";
import type { Breakdown, MediaType, MetricRow, ScoreRow, SourceInfo, StyleId } from "./types";
import { formatBytes, formatDuration } from "./validation";

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const has = (text: string, words: string[]) => words.some((w) => new RegExp(`\\b${w}`, "i").test(text));

const LOCATIONS = [
  "diner", "kitchen", "office", "bar", "apartment", "car", "street", "alley", "station", "platform", "train",
  "field", "farm", "beach", "park", "rooftop", "hospital", "school", "church", "warehouse", "market", "forest",
  "room", "house", "garden", "lake", "highway", "stadium", "hotel", "lobby", "precinct", "lab", "studio",
];

export interface DetectedScene {
  timeOfDay: "night" | "dusk" | "day";
  setting: "interior" | "exterior";
  location: string;
  weather: string | null;
  subjects: "solo" | "duo" | "ensemble";
  motion: boolean;
  emotion: string;
}

export function detectScene(text: string): DetectedScene {
  const t = text.toLowerCase();
  const timeOfDay = has(t, ["night", "midnight", "dark", "neon", "2am", "3am", "late"])
    ? "night"
    : has(t, ["dusk", "sunset", "evening", "twilight", "golden"])
      ? "dusk"
      : "day";

  let location = "the location";
  let best = Infinity;
  for (const noun of LOCATIONS) {
    const m = new RegExp(`\\b${noun}`, "i").exec(t);
    if (m && m.index < best) {
      best = m.index;
      location = `the ${noun}`;
    }
  }

  const exteriorHint = has(t, ["ext\\.", "outside", "street", "alley", "field", "farm", "beach", "park", "rooftop", "forest", "highway", "lake", "garden", "platform", "market"]);
  const interiorHint = has(t, ["int\\.", "inside", "room", "kitchen", "office", "diner", "bar", "apartment", "hospital", "lobby", "precinct", "hotel", "house"]);
  const setting = interiorHint && (!exteriorHint || t.indexOf("int.") !== -1) ? "interior" : exteriorHint ? "exterior" : "interior";

  const weather = has(t, ["rain", "storm", "drizzle"]) ? "Rain" : has(t, ["snow"]) ? "Snow" : has(t, ["fog", "mist", "haze"]) ? "Fog" : null;

  const subjects = has(t, ["crowd", "everyone", "family", "guests", "people", "friends", "group", "villagers", "crew", "commuters", "class"])
    ? "ensemble"
    : has(t, ["two", "both", "pair", "couple", "each other", "together"]) || (has(t, ["he", "him"]) && has(t, ["she", "her"]))
      ? "duo"
      : "solo";

  const motion = has(t, ["run", "walk", "drive", "chase", "rush", "dance", "ride", "hurr", "board"]);

  const emotion = has(t, ["argu", "fight", "scared", "gun", "silent", "interrog", "threat", "tense", "nervous", "suspect"])
    ? "Tension"
    : has(t, ["laugh", "hug", "celebrat", "smile", "reunion", "festival", "joy"])
      ? "Warmth"
      : has(t, ["cry", "alone", "grief", "lonely", "goodbye", "tired"])
        ? "Melancholy"
        : "Neutral / observational";

  return { timeOfDay, setting, location, weather, subjects, motion, emotion };
}

function realLighting(d: DetectedScene): { lighting: string; temp: string; contrast: string } {
  if (d.timeOfDay === "night" && d.setting === "interior")
    return { lighting: "Overhead fluorescents & practicals, flat", temp: "≈ 4000K with green spike", contrast: "Low — ≈ 2:1" };
  if (d.timeOfDay === "night")
    return { lighting: "Mixed streetlights, sodium + LED", temp: "Mixed 2200K / 5000K", contrast: "Uneven — hot spots, no shape" };
  if (d.timeOfDay === "dusk")
    return { lighting: "Fading ambient sky, no direction", temp: "≈ 4500K, drifting", contrast: "Low — ≈ 2:1" };
  if (d.setting === "interior")
    return { lighting: "Window daylight, uneven falloff", temp: "≈ 5200K / 3000K mixed", contrast: "Medium — ≈ 3:1" };
  return { lighting: "Hard overhead sun, top-light", temp: "≈ 5600K", contrast: "Harsh — clipped highlights" };
}

function aspectLabel(w?: number, h?: number): string {
  if (!w || !h) return "Undefined";
  const r = w / h;
  const known: [number, string][] = [[16 / 9, "16:9"], [9 / 16, "9:16 vertical"], [4 / 3, "4:3"], [2.39, "2.39:1"], [1, "1:1"], [1.85, "1.85:1"]];
  const hit = known.find(([v]) => Math.abs(v - r) < 0.03);
  return hit ? hit[1] : `${r.toFixed(2)}:1`;
}

const SUBJECT_LABEL = { solo: "the lead", duo: "the two leads", ensemble: "the group" } as const;
const SUBJECT_TAG = { solo: "Solo subject", duo: "Two-hander", ensemble: "Ensemble" } as const;

export interface AnalysisInput {
  title: string;
  mediaType: MediaType;
  source: SourceInfo;
  styleId: StyleId;
  moodIndex: number;
}

export function analyzeScene(input: AnalysisInput): Breakdown {
  const style = getStyle(input.styleId);
  const moodIndex = ((input.moodIndex % style.moods.length) + style.moods.length) % style.moods.length;
  const mood = style.moods[moodIndex];
  const { source } = input;

  const text =
    input.mediaType === "script"
      ? `${input.title} ${source.script ?? ""}`
      : `${input.title} ${(source.fileName ?? "").replace(/[_\-.]+/g, " ")}`;
  const d = detectScene(text);
  const light = realLighting(d);
  const seed = hashString(`${text}|${style.id}|${moodIndex}`);

  const sourceFacts =
    input.mediaType === "video"
      ? [
          { label: "File", value: source.fileName ?? "clip" },
          { label: "Duration", value: source.duration ? formatDuration(source.duration) : "—" },
          { label: "Resolution", value: source.width && source.height ? `${source.width}×${source.height}` : "—" },
          { label: "Size", value: source.fileSize ? formatBytes(source.fileSize) : "—" },
        ]
      : [
          { label: "Format", value: "Scene script" },
          { label: "Words", value: String((source.script ?? "").trim().split(/\s+/).filter(Boolean).length) },
          { label: "Est. screen time", value: formatDuration(Math.max(20, ((source.script ?? "").length / 15) | 0)) },
          { label: "Characters", value: String((source.script ?? "").length) },
        ];

  const metrics: MetricRow[] = [
    { label: "Lighting", real: light.lighting, cinematic: style.lighting.summary.split(".")[0] },
    { label: "Color temperature", real: light.temp, cinematic: style.colorTemp },
    { label: "Contrast", real: light.contrast, cinematic: style.contrast },
    { label: "Color grade", real: input.mediaType === "video" ? "Camera native, ungraded" : "Not specified", cinematic: style.grade },
    { label: "Framing", real: input.mediaType === "video" ? "Eye-level, unplanned coverage" : "No defined coverage", cinematic: style.camera.compositionLabel },
    { label: "Camera movement", real: d.motion ? "Handheld follow, unstable" : "Static or incidental", cinematic: style.camera.movementLabel },
    { label: "Lens", real: input.mediaType === "video" ? "Wide default (≈ 26mm equiv.)" : "Unspecified", cinematic: style.camera.lens },
    { label: "Aspect ratio", real: input.mediaType === "video" ? aspectLabel(source.width, source.height) : "Undefined", cinematic: style.aspectRatio },
    { label: "Emotional tone", real: d.emotion, cinematic: style.mood },
  ];

  const scoreLabels = ["Composition", "Lighting depth", "Color cohesion", "Emotional read"];
  const scores: ScoreRow[] = scoreLabels.map((label, i) => {
    const h = hashString(`${seed}-${label}-${i}`);
    return { label, real: 22 + (h % 31), cinematic: 84 + ((h >> 8) % 14) };
  });

  const subject = SUBJECT_LABEL[d.subjects];
  const shots = style.shots.map((s, i) => ({
    ...s,
    id: `${String(i + 1).padStart(2, "0")}${String.fromCharCode(65 + moodIndex)}`,
    note: s.note.replace(/\{subject\}/g, subject).replace(/\{location\}/g, d.location).replace(/^the/, "The"),
    paletteAnchor: mood.palette[i % mood.palette.length].name,
  }));

  const settingWord = d.setting === "interior" ? "interior" : "exterior";
  const time = d.timeOfDay === "day" ? "daytime" : d.timeOfDay === "dusk" ? "dusk" : "night";
  const realSummary = `A ${time} ${settingWord} scene in ${d.location} with ${subject}, lit by ${light.lighting.toLowerCase()}.${
    d.weather ? ` ${d.weather} present.` : ""
  } ${d.motion ? "Subjects are in motion." : "Mostly static blocking."}`;
  const cinematicSummary = `Reimagined as ${style.name} (${mood.name}): ${style.tagline} Shot ${style.aspectRatio} on a ${style.camera.lens} with ${style.camera.movementLabel.toLowerCase()}, graded toward ${style.grade.toLowerCase()}.`;

  const detectedTags = [
    d.setting === "interior" ? "INT." : "EXT.",
    d.timeOfDay.toUpperCase(),
    SUBJECT_TAG[d.subjects],
    d.emotion.split(" ")[0],
    ...(d.weather ? [d.weather] : []),
    ...(d.motion ? ["Motion"] : []),
  ];

  return {
    styleId: style.id,
    moodIndex,
    moodName: mood.name,
    realSummary,
    cinematicSummary,
    sourceFacts,
    detectedTags,
    metrics,
    scores,
    palette: mood.palette,
    shots,
  };
}

/** Log lines per tracker step, derived from the finished breakdown. */
export function trackerLogs(b: Breakdown, mediaType: MediaType): string[][] {
  const style = getStyle(b.styleId);
  return [
    [
      mediaType === "video" ? "Decoding frames & sampling luminance…" : "Tokenising scene description…",
      `Detected: ${b.detectedTags.slice(0, 3).join(" · ")}`,
      `Baseline lighting: ${b.metrics[0].real}`,
      `Baseline tone: ${b.metrics[8].real}`,
    ],
    [
      `Composition model: ${style.camera.compositionLabel}`,
      `Conforming aspect → ${style.aspectRatio}`,
      `Camera solve: ${style.camera.angle}`,
    ],
    [
      `Palette "${b.moodName}" · ${b.palette.length} swatches`,
      `Lighting rig: ${style.lighting.sources.length} sources @ ${style.lighting.ratio}`,
      `Grade: ${style.grade}`,
    ],
    [`Shot list assembled: ${b.shots.length} setups`, "Rendering cinematic breakdown…", "Output ready."],
  ];
}
