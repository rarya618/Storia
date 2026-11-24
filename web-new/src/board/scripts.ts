import { useEffect, useMemo, useState } from "react";
import { get } from "firebase/database";
import { getDocumentRef } from "../firebase/database";
import { rememberDocument, seenDocument } from "../misc/seen";
import { readBlocks } from "../screenplay/content";
import { characterNames } from "../screenplay/characters";
import { inDraftOrder } from "../screenplay/revisions";
import { headingParts, Scene, toScenes } from "../screenplay/structure";
import { titleCase } from "../components/screenplay/cast";
import { ScriptBlock } from "../screenplay/types";

// one of the project's drafts as a card's links need it: its scenes and its cast
export type ProjectScript = {id: string, name: string, scenes: Scene[], cast: string[]};

export const scriptOf = (id: string, name: string, blocks: ScriptBlock[]): ProjectScript =>
  ({id, name, scenes: toScenes(blocks), cast: characterNames(blocks)});

type Loaded = {id: string, name: string, createdOn?: string, blocks: ScriptBlock[]};

// the project's drafts, oldest first, read once each (starting from what this
// tab last saw) for the card page's scene and character links. undefined until
// the first has arrived. `live` stands in for a draft open in the editor, so
// its links follow what's being typed
export const useProjectScripts = (documents?: Record<string, {name?: string}>, live?: {id: string, blocks: ScriptBlock[]}) => {
  const ids = Object.keys(documents ?? {}).sort().join(",");
  const [loaded, setLoaded] = useState<Record<string, Loaded>>({});

  useEffect(() => {
    let cancelled = false;
    const wanted = ids ? ids.split(",") : [];
    const start: Record<string, Loaded> = {};
    for (const id of wanted) {
      const seen = seenDocument(id);
      if (seen) start[id] = {id, name: seen.name, createdOn: seen.createdOn, blocks: readBlocks(seen.content)};
    }
    setLoaded(start);
    for (const id of wanted) {
      get(getDocumentRef(id)).then(snapshot => {
        if (cancelled || !snapshot.exists()) return;
        const doc = {id, ...snapshot.val()};
        rememberDocument(doc);
        setLoaded(current => ({...current, [id]: {id, name: doc.name, createdOn: doc.createdOn, blocks: readBlocks(doc.content)}}));
      }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [ids]);

  return useMemo(() => {
    const drafts = Object.values(loaded);
    if (drafts.length === 0 && !live) return undefined;
    return inDraftOrder(drafts).map(draft =>
      scriptOf(draft.id, documents?.[draft.id]?.name || draft.name || "Untitled", live?.id === draft.id ? live.blocks : draft.blocks));
    // documents only for the names, which the ids key already tracks closely enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, live]);
};

// "Sc. 12 · Station Café", or the opening, or a scene with no location yet
export const sceneName = (scene: Scene) => {
  const location = headingParts(scene.heading).location;
  if (scene.number === 0) return "Opening";
  return "Sc. " + scene.number + (location ? " · " + titleCase(location) : "");
};
