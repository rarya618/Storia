import Document from "../datatypes/Document";
import { getRelativeDate } from "../misc/date";
import { titleCase } from "../components/screenplay/cast";
import { estimatePages } from "./pages";
import { characterIndex, toScenes, totalRuntime } from "./structure";
import { ScriptBlock } from "./types";

export const documentWhen = (doc: Document) =>
  doc.lastUpdated ? "Updated " + getRelativeDate(doc.lastUpdated) : doc.createdOn ? "Created " + getRelativeDate(doc.createdOn) : "";

// what a sheet's stats and cast line say about a script
export const describe = (blocks: ScriptBlock[]) => {
  // only what's written counts, so an untouched draft reads as empty, not one scene
  const scenes = toScenes(blocks.filter(block => block.text.trim() !== ""));
  const cast = [...characterIndex(scenes).entries()]
    .sort(([nameA, a], [nameB, b]) => b.cues - a.cues || nameA.localeCompare(nameB))
    .map(([name]) => titleCase(name));
  return {
    pages: estimatePages(blocks),
    scenes: scenes.filter(scene => scene.number > 0).length,
    runtime: totalRuntime(scenes),
    cast,
  };
};
