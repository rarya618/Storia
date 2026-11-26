import { estimatePages } from "@screenplay/pages";
import { ElementType, ScriptBlock } from "@screenplay/types";

// A made-up feature-length script (about 120 pages, a few thousand blocks) for
// trying the editor at a real script's size. Seeded, so every run is the same.

const random = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const PLACES = [
  "INT. HARBOUR MASTER'S OFFICE - NIGHT", "EXT. COASTAL ROAD - DAY", "INT. MARGO'S KITCHEN - MORNING",
  "EXT. LIGHTHOUSE GALLERY - DUSK", "INT. COUNTY RECORDS ROOM - DAY", "INT. ALL-NIGHT DINER - NIGHT",
  "EXT. FERRY DECK - CONTINUOUS", "INT. THEO'S CAR - MOVING - NIGHT", "EXT. SALT FLATS - DAWN",
  "INT. SCHOOL GYMNASIUM - EVENING",
];
const CAST = ["MARGO", "THEO", "INSPECTOR VANCE", "LUCIA", "OLD PETE"];
const ACTION = [
  "Rain needles the window. A radio mutters the shipping forecast to nobody.",
  "She turns the photograph over. A date, in pencil, half rubbed away.",
  "He doesn't answer. Somewhere below, a hull knocks against the pier.",
  "The fluorescent tube flickers twice and settles into a low hum.",
  "A gull lands on the railing, considers them both, and leaves.",
  "Boxes of ledgers, floor to ceiling. Dust hangs in the window light.",
  "Headlights sweep the ceiling and are gone.",
];
const LINES = [
  "You kept it all this time?",
  "I kept what I could carry. That's not the same thing.",
  "Nobody comes out here unless they're looking for something.",
  "Then you'd better tell me what I'm looking for.",
  "The tide doesn't care what we meant to do.",
  "Say that again, slower.",
  "It was never about the money. You know that.",
  "Fine. But we do it my way, and we do it tonight.",
];
const ASIDES = ["(quietly)", "(beat)", "(not looking up)", "(into the phone)"];

export const sampleScript = (): ScriptBlock[] => {
  const next = random(42);
  const pick = <T,>(list: T[]) => list[Math.floor(next() * list.length)];
  const blocks: ScriptBlock[] = [];
  let id = 0;
  const add = (type: ElementType, text: string) => blocks.push({id: `s${id++}`, type, text});

  for (let scene = 0; estimatePages(blocks) < 120; scene++) {
    if (scene % 30 === 0) add("act", `ACT ${["ONE", "TWO", "THREE", "FOUR", "FIVE"][scene / 30] ?? "SIX"}`);
    add("heading", pick(PLACES));
    add("action", pick(ACTION) + " " + pick(ACTION));
    const speakers = [pick(CAST), pick(CAST)];
    const exchanges = 3 + Math.floor(next() * 5);
    for (let line = 0; line < exchanges; line++) {
      add("character", speakers[line % 2]);
      if (next() < 0.2) add("parenthetical", pick(ASIDES));
      add("dialogue", pick(LINES));
      if (next() < 0.3) add("action", pick(ACTION));
    }
    if (next() < 0.25) add("transition", "CUT TO:");
  }
  return blocks;
};
