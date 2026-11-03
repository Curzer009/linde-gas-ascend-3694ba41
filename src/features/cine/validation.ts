export const MAX_TITLE_CHARS = 80;
export const MIN_SCRIPT_CHARS = 40;
export const MAX_SCRIPT_CHARS = 5000;
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"];
export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv"];

export function validateTitle(title: string): string | null {
  const t = title.trim();
  if (!t) return "Give your project a title.";
  if (t.length > MAX_TITLE_CHARS) return `Keep the title under ${MAX_TITLE_CHARS} characters.`;
  return null;
}

export function validateScript(script: string): string | null {
  const s = script.trim();
  if (!s) return "Describe the real-world scene or paste a script.";
  if (s.length < MIN_SCRIPT_CHARS) return `Add a bit more detail — at least ${MIN_SCRIPT_CHARS} characters.`;
  if (s.length > MAX_SCRIPT_CHARS) return `Scripts are limited to ${MAX_SCRIPT_CHARS.toLocaleString()} characters.`;
  return null;
}

export function validateVideoFile(file: { name: string; type: string; size: number } | null): string | null {
  if (!file) return "Upload a video clip to analyse.";
  const lower = file.name.toLowerCase();
  const typeOk = ACCEPTED_VIDEO_TYPES.includes(file.type) || ACCEPTED_VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!typeOk) return "Unsupported format. Use MP4, MOV, WebM or MKV.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_VIDEO_BYTES) return "Clips must be 500 MB or smaller.";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
