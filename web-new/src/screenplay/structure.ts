import { ScriptBlock } from "./types";
import { LINE_WIDTH } from "./pages";
import { characterName } from "./characters";

export type Scene = {
  id: string,            // the heading block's id (or the first block's, for an opening with no heading)
  number: number,        // 1-based; 0 for text before the first heading
  heading: string,
  blocks: ScriptBlock[],
  startIndex: number,    // index of the scene's first block in the script
  lines: number,         // printed lines, used for length and the plot
  speech: {at: number, size: number}[], // dialogue runs: line offset into the scene and length in lines
  cast: string[],        // character names, in order of first appearance in the scene
};

const LINES_PER_PAGE = 55;

const linesFor = (block: ScriptBlock) =>
  block.text.split("\n").reduce((total, line) => total + Math.max(1, Math.ceil(line.length / LINE_WIDTH[block.type])), 0);

// split the script into scenes at each scene heading
export const toScenes = (blocks: ScriptBlock[]): Scene[] => {
  const scenes: Scene[] = [];
  let current: Scene | undefined;

  blocks.forEach((block, index) => {
    if (block.type === "heading" || !current) {
      current = {
        id: block.id,
        number: block.type === "heading" ? scenes.filter(scene => scene.number > 0).length + 1 : 0,
        heading: block.type === "heading" ? block.text.trim() : "",
        blocks: [],
        startIndex: index,
        lines: 0,
        speech: [],
        cast: [],
      };
      scenes.push(current);
    }

    const size = linesFor(block);
    if (block.type === "dialogue" || block.type === "parenthetical") {
      const last = current.speech[current.speech.length - 1];
      // consecutive speech lines form one run
      if (last && last.at + last.size === current.lines) last.size += size;
      else current.speech.push({at: current.lines, size});
    }
    if (block.type === "character") {
      const name = characterName(block.text);
      if (name && !current.cast.includes(name)) current.cast.push(name);
    }

    current.blocks.push(block);
    current.lines += size + (current.blocks.length > 1 && !["dialogue", "parenthetical"].includes(block.type) ? 1 : 0);
  });

  // an opening with no heading and no text isn't a scene
  return scenes.filter(scene => scene.number > 0 || scene.blocks.some(block => block.text.trim() !== ""));
};

// the scene containing a block
export const sceneOf = (scenes: Scene[], blockId?: string) =>
  blockId ? scenes.find(scene => scene.blocks.some(block => block.id === blockId)) : undefined;

// scene length the way production measures it: pages and eighths ("1 3/8")
export const eighths = (lines: number) => {
  const total = Math.max(1, Math.round(lines / LINES_PER_PAGE * 8));
  const pages = Math.floor(total / 8);
  const rest = total % 8;
  if (pages === 0) return rest + "/8";
  return rest === 0 ? String(pages) : pages + " " + rest + "/8";
};

// split "INT. ALLEY BEHIND THE CLUB - NIGHT" into its parts
export const headingParts = (heading: string) => {
  const upper = heading.toUpperCase().trim();
  const match = upper.match(/^(INT\.?\/EXT\.?|I\/E\.?|INT\.?|EXT\.?|EST\.?)\s*(.*)$/);
  const place = match ? match[1].replace(/\.$/, "") : "";
  const rest = (match ? match[2] : upper).trim();
  const dash = rest.lastIndexOf(" - ");
  return {
    place,
    location: (dash >= 0 ? rest.slice(0, dash) : rest).trim(),
    time: dash >= 0 ? rest.slice(dash + 3).trim() : "",
  };
};

// the hairline pulse for one scene: a baseline whose length follows the scene's
// length and whose peaks are its dialogue runs
export const pulsePath = (scene: Scene, maxLines: number, width: number, amplitude: number, seed: string) => {
  const length = Math.max(12, (scene.lines / Math.max(maxLines, 1)) * width);
  const step = 2;
  let noiseState = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const noise = () => {
    noiseState = (noiseState * 1664525 + 1013904223) >>> 0;
    return (noiseState / 4294967296 - 0.5) * 0.8;
  };

  const points: [number, number][] = [];
  for (let x = 0; x <= length; x += step) {
    const at = (x / length) * scene.lines;
    let lift = 0;
    for (const run of scene.speech) {
      const centre = run.at + run.size / 2;
      const spread = Math.max(1.2, run.size / 2);
      const height = Math.min(1, 0.35 + run.size / 10);
      lift += height * Math.exp(-((at - centre) ** 2) / (2 * spread * spread));
    }
    // taper the ends so each pulse starts and finishes on its baseline
    const taper = Math.min(1, x / 10, (length - x) / 10);
    points.push([x, -(Math.min(lift, 1.4) * amplitude + noise()) * Math.max(0, taper)]);
  }
  return {length, points};
};

// screen time: a page runs about a minute ("1:37")
export const runtime = (lines: number) => {
  const seconds = Math.round((lines / LINES_PER_PAGE) * 60);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
};

// the whole script's running time ("00:01:47")
export const totalRuntime = (scenes: Scene[]) => {
  const seconds = Math.round((scenes.reduce((sum, scene) => sum + scene.lines, 0) / LINES_PER_PAGE) * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return pad(Math.floor(seconds / 3600)) + ":" + pad(Math.floor(seconds / 60) % 60) + ":" + pad(seconds % 60);
};

// a scene's summary: its first line of action
export const sceneSummary = (scene: Scene) =>
  scene.blocks.find(block => block.type === "action" && block.text.trim() !== "")?.text.trim() ?? "";

export const wordCount = (blocks: ScriptBlock[]) =>
  blocks.reduce((total, block) => total + (block.text.trim() ? block.text.trim().split(/\s+/).length : 0), 0);

// every character with the scenes they appear in and how many cues they have
export const characterIndex = (scenes: Scene[]) => {
  const index = new Map<string, {scenes: number[], cues: number}>();
  for (const scene of scenes) {
    for (const block of scene.blocks) {
      if (block.type !== "character") continue;
      const name = characterName(block.text);
      if (!name) continue;
      const entry = index.get(name) ?? {scenes: [], cues: 0};
      entry.cues += 1;
      if (!entry.scenes.includes(scene.number)) entry.scenes.push(scene.number);
      index.set(name, entry);
    }
  }
  return index;
};
