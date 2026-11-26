import Document from "@storia/core/datatypes/Document";
import { getRelativeDate } from "../misc/date";
import { titleCase } from "@storia/core/screenplay/cast";
import { estimatePages } from "@storia/core/screenplay/pages";
import { characterIndex, toScenes, totalRuntime } from "@storia/core/screenplay/structure";
import { ScriptBlock } from "@storia/core/screenplay/types";

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
