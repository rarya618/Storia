import { useEffect, useState } from "react";
import { get } from "@react-native-firebase/database";
import { Revision, inDraftOrder, revisionAt } from "@storia/core/screenplay/revisions";
import { createdOnRef } from "./database";

// A draft's revision colour is its place in the order its project's drafts were
// made, as on the web (screenplay/revisions.ts). The summaries a project keeps
// don't carry that date, so it's read from each document once and kept: it never changes.

export type Placed = {revision: Revision, index: number};

const known = new Map<string, string>();

const readMade = (id: string): Promise<string> => known.has(id)
  ? Promise.resolve(known.get(id)!)
  : get(createdOnRef(id)).then(snapshot => {
    const value = String(snapshot.val() ?? "");
    known.set(id, value);
    return value;
  }, () => "");

// when each of these documents was made, by id; undefined until all are known
export function useMade(ids: string[]): Map<string, string> | undefined {
  const key = [...ids].sort().join(",");
  const [made, setMade] = useState<{key: string, map: Map<string, string>}>();

  useEffect(() => {
    let live = true;
    const drafts = key ? key.split(",") : [];
    Promise.all(drafts.map(async id => [id, await readMade(id)] as const)).then(dated => {
      if (live) setMade({key, map: new Map(dated)});
    });
    return () => { live = false; };
  }, [key]);

  return made?.key === key ? made.map : undefined;
}

// one project's drafts, each with its revision, oldest first
export const placeDrafts = <T extends {id: string}>(drafts: T[], made: Map<string, string>) =>
  inDraftOrder(drafts.map(draft => ({...draft, createdOn: made.get(draft.id)})))
    .map((draft, index) => ({...draft, revision: revisionAt(index), index}));
