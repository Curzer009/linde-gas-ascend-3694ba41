export type MediaType = "video" | "script";
export type StyleId = "neo-noir" | "anderson" | "fincher" | "golden-hour";
export type Composition = "symmetry" | "thirds" | "leading" | "centered-low";
export type Movement = "tracking" | "whip-pan" | "locked" | "crane";

export interface PaletteColor {
  name: string;
  hex: string;
  role: string;
  /** Approximate share of the frame, in percent. */
  share: number;
}

export interface Mood {
  name: string;
  palette: PaletteColor[];
}

export interface LightSource {
  id: string;
  label: string;
  /** Degrees around the subject: 0 = from camera, 90 = camera-right, 180 = behind, -90 = camera-left. */
  angle: number;
  /** 0..1 distance from subject on the plot. */
  distance: number;
  /** Output, in percent. */
  intensity: number;
  colorTemp: string;
  modifier: string;
  note: string;
  hex: string;
}

export interface ShotTemplate {
  type: string;
  lens: string;
  movement: string;
  duration: string;
  light: string;
  note: string;
}

export interface CinematicStyle {
  id: StyleId;
  name: string;
  shortName: string;
  tagline: string;
  reference: string;
  aspectRatio: string;
  aspectValue: number;
  colorTemp: string;
  contrast: string;
  grade: string;
  mood: string;
  camera: {
    angle: string;
    lens: string;
    movement: Movement;
    movementLabel: string;
    composition: Composition;
    compositionLabel: string;
    description: string;
  };
  lighting: {
    summary: string;
    ratio: string;
    sources: LightSource[];
  };
  moods: Mood[];
  shots: ShotTemplate[];
}

export interface SourceInfo {
  script?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface MetricRow {
  label: string;
  real: string;
  cinematic: string;
}

export interface ScoreRow {
  label: string;
  real: number;
  cinematic: number;
}

export interface ShotSpec extends ShotTemplate {
  id: string;
  paletteAnchor: string;
}

export interface Breakdown {
  styleId: StyleId;
  moodIndex: number;
  moodName: string;
  realSummary: string;
  cinematicSummary: string;
  sourceFacts: { label: string; value: string }[];
  detectedTags: string[];
  metrics: MetricRow[];
  scores: ScoreRow[];
  palette: PaletteColor[];
  shots: ShotSpec[];
}

export interface Project {
  id: string;
  title: string;
  mediaType: MediaType;
  source: SourceInfo;
  styleId: StyleId;
  moodIndex: number;
  createdAt: number;
  startedAt: number;
  status: "processing" | "complete";
  breakdown: Breakdown;
}
