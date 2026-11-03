import type { CinematicStyle, StyleId } from "./types";

export const STYLES: CinematicStyle[] = [
  {
    id: "neo-noir",
    name: "Cyberpunk Neo-Noir",
    shortName: "Neo-Noir",
    tagline: "Rain-slick neon, hard shadows, synthetic haze.",
    reference: "Blade Runner 2049 · Ghost in the Shell",
    aspectRatio: "2.39:1 Anamorphic",
    aspectValue: 2.39,
    colorTemp: "3200K key vs 6500K neon spill",
    contrast: "High — 8:1",
    grade: "Teal shadows, magenta highlights, crushed blacks",
    mood: "Alienated, rain-soaked unease",
    camera: {
      angle: "Low angle, 12° Dutch tilt",
      lens: "40mm anamorphic, T2.3",
      movement: "tracking",
      movementLabel: "Slow lateral tracking shot",
      composition: "leading",
      compositionLabel: "Leading lines into negative space",
      description:
        "Hold the subject on the right third while wet reflections and signage pull the eye across the frame. A slow lateral track at walking pace keeps the city moving behind them; anamorphic flares streak horizontally off every practical.",
    },
    lighting: {
      summary: "Motivated by neon practicals with deep negative fill. Haze in the air so every beam reads.",
      ratio: "8:1 key-to-fill",
      sources: [
        { id: "key", label: "Key", angle: 60, distance: 0.55, intensity: 72, colorTemp: "Magenta gel ≈ 5600K", modifier: "Bare LED tube", note: "Sign spill, camera-right, slightly above eye line.", hex: "#FF2E88" },
        { id: "fill", label: "Fill", angle: -110, distance: 0.7, intensity: 18, colorTemp: "Cyan ≈ 6500K", modifier: "Bounce off wet ground", note: "Barely there — keep the shadow side cold.", hex: "#00E5FF" },
        { id: "back", label: "Rim", angle: 170, distance: 0.5, intensity: 88, colorTemp: "6500K", modifier: "Hard fresnel, 10° spot", note: "Separates silhouette from the rain.", hex: "#E6F7FF" },
        { id: "ambient", label: "Ambient", angle: -30, distance: 0.95, intensity: 25, colorTemp: "Sodium ≈ 2200K", modifier: "Haze + distant practicals", note: "Atmosphere only; never on the face.", hex: "#F5B942" },
      ],
    },
    moods: [
      {
        name: "Neon Rain",
        palette: [
          { name: "Void Navy", hex: "#0B0F1A", role: "Shadows & night sky", share: 38 },
          { name: "Cyan Spill", hex: "#00E5FF", role: "Cold fill & reflections", share: 20 },
          { name: "Magenta Neon", hex: "#FF2E88", role: "Key light & signage", share: 18 },
          { name: "Synthetic Violet", hex: "#7A3CFF", role: "Midtone haze", share: 14 },
          { name: "Sodium Amber", hex: "#F5B942", role: "Distant practicals", share: 10 },
        ],
      },
      {
        name: "Chrome Dawn",
        palette: [
          { name: "Gunmetal", hex: "#101418", role: "Shadows", share: 36 },
          { name: "Oxide Teal", hex: "#2EC4B6", role: "Fill & screens", share: 22 },
          { name: "Fog White", hex: "#E0E1DD", role: "Overcast sky", share: 18 },
          { name: "Signal Orange", hex: "#FF6B35", role: "Accent practicals", share: 12 },
          { name: "Dusk Indigo", hex: "#3D405B", role: "Midtones", share: 12 },
        ],
      },
    ],
    shots: [
      { type: "Extreme wide — establishing", lens: "28mm anamorphic", movement: "Slow crane down", duration: "6s", light: "Haze + signage", note: "Rain over {location}; find {subject} as a single silhouette." },
      { type: "Medium tracking", lens: "40mm anamorphic", movement: "Lateral track, walking pace", duration: "8s", light: "Magenta key, cyan fill", note: "Glass and puddle reflections between camera and {subject}." },
      { type: "Close-up", lens: "75mm anamorphic", movement: "Static, slight Dutch", duration: "4s", light: "Hard rim + neon key", note: "Half the face in shadow; neon flickers once." },
      { type: "Insert", lens: "100mm macro", movement: "Rack focus", duration: "3s", light: "Practical only", note: "A small object in {location} catches the light." },
      { type: "Over-the-shoulder", lens: "50mm anamorphic", movement: "Slow push-in", duration: "6s", light: "Backlit through rain", note: "Foreground shoulder nearly black; flare across frame." },
      { type: "Wide — exit", lens: "32mm anamorphic", movement: "Tracking pull-back", duration: "7s", light: "Signage fade", note: "{subject} recedes; the city swallows the frame." },
    ],
  },
  {
    id: "anderson",
    name: "Wes Anderson Symmetry",
    shortName: "Anderson",
    tagline: "Centered frames, pastel order, deadpan precision.",
    reference: "The Grand Budapest Hotel · Moonrise Kingdom",
    aspectRatio: "1.37:1 Academy",
    aspectValue: 1.37,
    colorTemp: "5600K soft daylight",
    contrast: "Low — 2:1",
    grade: "Lifted pastels, warm highlights, clean whites",
    mood: "Deadpan whimsy with buried melancholy",
    camera: {
      angle: "Eye level, perfectly frontal",
      lens: "27mm spherical",
      movement: "whip-pan",
      movementLabel: "Whip pans & planimetric dolly",
      composition: "symmetry",
      compositionLabel: "One-point symmetry, centered subject",
      description:
        "Place the subject dead-center with the set built around them like a diorama. Move only on clean axes — 90° whip pans between characters and straight lateral dollies past rooms. Nothing tilts, nothing drifts.",
    },
    lighting: {
      summary: "Bright, even, shadowless. Large soft sources overhead so the palette stays flat and graphic.",
      ratio: "2:1 key-to-fill",
      sources: [
        { id: "key", label: "Key", angle: 0, distance: 0.6, intensity: 70, colorTemp: "5600K", modifier: "8×8 silk, frontal", note: "Straight on the subject from behind camera.", hex: "#FFF1D6" },
        { id: "fill", label: "Fill", angle: 0, distance: 0.85, intensity: 50, colorTemp: "5600K", modifier: "Overhead bounce", note: "Fills every corner of the set evenly.", hex: "#F7E1A1" },
        { id: "back", label: "Top", angle: 180, distance: 0.35, intensity: 40, colorTemp: "4800K", modifier: "Soft overhead box", note: "Gentle separation, no hard rim.", hex: "#F4B6C2" },
        { id: "ambient", label: "Practicals", angle: 90, distance: 0.9, intensity: 30, colorTemp: "3200K", modifier: "Visible lamps & sconces", note: "Decorative, placed symmetrically.", hex: "#E8C547" },
      ],
    },
    moods: [
      {
        name: "Patisserie",
        palette: [
          { name: "Mendl's Pink", hex: "#F4B6C2", role: "Walls & set dressing", share: 34 },
          { name: "Butter Yellow", hex: "#F7E1A1", role: "Highlights", share: 22 },
          { name: "Sea-foam", hex: "#8FBFBF", role: "Secondary set color", share: 18 },
          { name: "Bellhop Red", hex: "#C9474A", role: "Costume accent", share: 14 },
          { name: "Lobby Plum", hex: "#3E2F5B", role: "Shadows & type", share: 12 },
        ],
      },
      {
        name: "Scout Camp",
        palette: [
          { name: "Mustard", hex: "#E8C547", role: "Uniforms & signage", share: 30 },
          { name: "Moss", hex: "#6B8F71", role: "Foliage", share: 24 },
          { name: "Rust", hex: "#D9724A", role: "Props", share: 16 },
          { name: "Canvas", hex: "#F2E8CF", role: "Highlights", share: 18 },
          { name: "Lake Navy", hex: "#2D4057", role: "Shadows", share: 12 },
        ],
      },
    ],
    shots: [
      { type: "Wide — centered tableau", lens: "27mm", movement: "Locked-off", duration: "5s", light: "Even frontal soft", note: "{location} framed like a dollhouse; {subject} exactly center." },
      { type: "Medium — frontal", lens: "35mm", movement: "Static", duration: "4s", light: "Frontal silk", note: "{subject} looks straight down the lens, deadpan." },
      { type: "Whip pan", lens: "27mm", movement: "90° whip pan", duration: "1s", light: "Matched both sides", note: "Snap to the reaction; both frames perfectly level." },
      { type: "Overhead insert", lens: "40mm", movement: "Top-down static", duration: "3s", light: "Overhead soft", note: "Hands arrange an object in a perfect grid." },
      { type: "Lateral dolly", lens: "27mm", movement: "Planimetric dolly", duration: "9s", light: "Room-by-room practicals", note: "Glide past the rooms of {location} in profile." },
      { type: "Wide — closing", lens: "24mm", movement: "Slow zoom out", duration: "6s", light: "Even soft", note: "Hold until the symmetry feels slightly sad." },
    ],
  },
  {
    id: "fincher",
    name: "Fincher Moody Realism",
    shortName: "Fincher",
    tagline: "Controlled darkness, sickly greens, surgical framing.",
    reference: "Zodiac · Gone Girl · Mindhunter",
    aspectRatio: "2.20:1",
    aspectValue: 2.2,
    colorTemp: "3800K tungsten-green mix",
    contrast: "Medium-high — 6:1",
    grade: "Yellow-green midtones, desaturated skin, deep shadows",
    mood: "Clinical dread and quiet obsession",
    camera: {
      angle: "Eye level, locked-off",
      lens: "32mm spherical",
      movement: "locked",
      movementLabel: "Locked-off with motivated micro-push",
      composition: "thirds",
      compositionLabel: "Rule of thirds, precise headroom",
      description:
        "The camera never moves without a reason. Frame on thirds with exact headroom, let the subject move within a static composition, and only push in by inches when the scene turns. Every pan is perfectly matched to the subject's motion.",
    },
    lighting: {
      summary: "Top-down practicals with heavy negative fill. Faces fall into shadow; eyes stay readable.",
      ratio: "6:1 key-to-fill",
      sources: [
        { id: "key", label: "Key", angle: 30, distance: 0.35, intensity: 64, colorTemp: "3800K + ¼ plus-green", modifier: "Overhead practical, soft", note: "Fluorescent-motivated, directly above.", hex: "#C6C98A" },
        { id: "fill", label: "Neg. fill", angle: -90, distance: 0.5, intensity: 6, colorTemp: "—", modifier: "Black floppy", note: "Pull light away from the shadow side.", hex: "#3B4A3F" },
        { id: "back", label: "Back", angle: 160, distance: 0.6, intensity: 45, colorTemp: "4300K", modifier: "Window, diffused", note: "Cool edge from a distant window.", hex: "#9FB0B6" },
        { id: "ambient", label: "Ambient", angle: -150, distance: 0.95, intensity: 20, colorTemp: "3200K", modifier: "Desk lamps in background", note: "Pools of light deep in frame.", hex: "#D8C9A3" },
      ],
    },
    moods: [
      {
        name: "Precinct",
        palette: [
          { name: "Basement Black", hex: "#0E1210", role: "Shadows", share: 40 },
          { name: "Bureau Green", hex: "#3B4A3F", role: "Walls & midtones", share: 22 },
          { name: "Fluorescent Olive", hex: "#A39E5A", role: "Key light cast", share: 14 },
          { name: "Paper Stock", hex: "#D8C9A3", role: "Highlights & documents", share: 12 },
          { name: "Steel", hex: "#6E7B7F", role: "Cool windows", share: 12 },
        ],
      },
      {
        name: "Midnight Archive",
        palette: [
          { name: "Ink", hex: "#0A0D12", role: "Shadows", share: 42 },
          { name: "Slate", hex: "#24323F", role: "Midtones", share: 22 },
          { name: "Brass", hex: "#8C7A4B", role: "Lamp light", share: 12 },
          { name: "Vellum", hex: "#C7B98E", role: "Highlights", share: 12 },
          { name: "Lichen", hex: "#4F5D57", role: "Walls", share: 12 },
        ],
      },
    ],
    shots: [
      { type: "Wide — locked-off", lens: "27mm", movement: "Static", duration: "5s", light: "Overhead practicals", note: "{location} in near-darkness; {subject} small in a pool of light." },
      { type: "Medium single", lens: "32mm", movement: "Static", duration: "6s", light: "Top key, negative fill", note: "Exact headroom; eyes on the upper third line." },
      { type: "Matched pan", lens: "40mm", movement: "Pan locked to subject", duration: "4s", light: "Motivated practicals", note: "Camera moves only as {subject} moves." },
      { type: "Insert", lens: "65mm", movement: "Static", duration: "2s", light: "Single desk lamp", note: "A detail that matters later, shot like evidence." },
      { type: "Close-up", lens: "50mm", movement: "Micro push-in, 6 inches", duration: "7s", light: "Top key, deep shadow", note: "Push only when the line lands." },
      { type: "Wide — reset", lens: "27mm", movement: "Static", duration: "4s", light: "Lights off one by one", note: "Return to the opening frame, now emptier." },
    ],
  },
  {
    id: "golden-hour",
    name: "Spielberg Golden Hour",
    shortName: "Golden Hour",
    tagline: "Backlit wonder, lens flare, the reveal.",
    reference: "E.T. · Saving Private Ryan · The Fabelmans",
    aspectRatio: "1.85:1",
    aspectValue: 1.85,
    colorTemp: "3000K sunset backlight / 5600K fill",
    contrast: "Medium — 4:1",
    grade: "Warm amber highlights, blue-hour shadows, bloom",
    mood: "Awe, nostalgia and hope",
    camera: {
      angle: "Low angle, looking up",
      lens: "35mm spherical",
      movement: "crane",
      movementLabel: "Crane up into slow push-in",
      composition: "centered-low",
      compositionLabel: "Low horizon, subject against the sky",
      description:
        "Start low and wide with the horizon in the bottom third so the sky dominates. Crane up to reveal the world, then push slowly into the face for the reaction — the classic Spielberg face. Let the sun flare straight into the lens.",
    },
    lighting: {
      summary: "Sun as a strong backlight through haze, with warm bounce on the faces for a glowing wraparound.",
      ratio: "4:1 back-to-fill",
      sources: [
        { id: "back", label: "Sun", angle: 175, distance: 0.95, intensity: 95, colorTemp: "3000K", modifier: "Natural, through haze", note: "Low sun behind subject — flare is welcome.", hex: "#FFB347" },
        { id: "fill", label: "Bounce", angle: 15, distance: 0.45, intensity: 40, colorTemp: "Gold reflector", modifier: "4×4 gold/silver bounce", note: "Warm wrap on the face.", hex: "#FCE9C5" },
        { id: "key", label: "Key", angle: -55, distance: 0.6, intensity: 55, colorTemp: "4300K", modifier: "Large soft source", note: "Shapes the face once the sun drops.", hex: "#FF7F50" },
        { id: "ambient", label: "Sky", angle: 120, distance: 0.95, intensity: 30, colorTemp: "8000K", modifier: "Open sky", note: "Cool blue in the shadows.", hex: "#2B4C7E" },
      ],
    },
    moods: [
      {
        name: "Magic Hour",
        palette: [
          { name: "Sunset Amber", hex: "#FFB347", role: "Backlight & sky", share: 30 },
          { name: "Ember Coral", hex: "#FF7F50", role: "Skin & warm midtones", share: 20 },
          { name: "Dusk Blue", hex: "#2B4C7E", role: "Shadows", share: 20 },
          { name: "Bloom Cream", hex: "#FCE9C5", role: "Highlights & flare", share: 16 },
          { name: "Silhouette Umber", hex: "#3A2618", role: "Silhouettes", share: 14 },
        ],
      },
      {
        name: "Suburban Night",
        palette: [
          { name: "Midnight Blue", hex: "#0F1C3F", role: "Night sky", share: 36 },
          { name: "Moonlight", hex: "#4A90C2", role: "Fill & smoke", share: 22 },
          { name: "Porch Light", hex: "#F3D27A", role: "Practicals", share: 16 },
          { name: "Flashlight", hex: "#E6E6E6", role: "Beams", share: 12 },
          { name: "Lawn Black", hex: "#1B1B1B", role: "Silhouettes", share: 14 },
        ],
      },
    ],
    shots: [
      { type: "Extreme wide — horizon", lens: "24mm", movement: "Crane up", duration: "8s", light: "Low sun backlight", note: "{location} at golden hour; the sky owns the frame." },
      { type: "Medium — low angle", lens: "35mm", movement: "Slow push-in", duration: "6s", light: "Sun rim + gold bounce", note: "{subject} looks up at something off-screen." },
      { type: "The Spielberg face", lens: "50mm", movement: "Slow dolly in", duration: "5s", light: "Warm wraparound", note: "Hold on the reaction, eyes catching the light." },
      { type: "POV reveal", lens: "35mm", movement: "Handheld rise", duration: "4s", light: "Flare into lens", note: "Show what they see — bigger than expected." },
      { type: "Oner — walk and talk", lens: "27mm", movement: "Steadicam, 360° move", duration: "20s", light: "Shifting sun angle", note: "One unbroken move through {location}." },
      { type: "Wide — silhouette", lens: "32mm", movement: "Crane down", duration: "7s", light: "Sun on the horizon", note: "{subject} as a silhouette against the last light." },
    ],
  },
];

export function getStyle(id: StyleId): CinematicStyle {
  return STYLES.find((s) => s.id === id) ?? STYLES[0];
}
