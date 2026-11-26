import { get, push, ref, update } from "firebase/database";
import { readBlocks } from "@storia/core/screenplay/content";
import { Versions, describeVersion, versionsToDrop, worthKeeping } from "@storia/core/screenplay/history";
import { rtdb } from "./main";

// Draft history (@storia/core/screenplay/history), beside the documents at
// history/{documentId}, so loading a script never carries its versions:
//   owner                  the document's owner, which the rules check
//   index/{versionId}      a VersionEntry: when, and how long, without the script
//   versions/{versionId}   that copy's content, read only when it's opened
// Deleting a document, or the project or folder holding it, deletes its history too.

const historyPath = (documentId: string) => "history/" + documentId;

export const getVersionsRef = (documentId: string) => ref(rtdb, historyPath(documentId) + "/index");

export const getVersionContent = async (documentId: string, versionId: string) =>
  readBlocks((await get(ref(rtdb, historyPath(documentId) + "/versions/" + versionId))).val());

// keep the script as it's stored now as a version, before a save replaces it.
// It reads the stored copy rather than taking the page's, so a script another
// tab or the phone saved since this one opened is the one kept. Nothing is
// written when the newest version already holds it, and the versions past
// keeping go in the same update
export async function keepVersion(documentId: string) {
  const [stored, index] = await Promise.all([
    get(ref(rtdb, "documents/" + documentId)),
    get(getVersionsRef(documentId)),
  ]);
  if (!stored.exists()) return;
  const data = stored.val();
  const blocks = readBlocks(data.content);
  const versions: Versions = index.val() ?? {};
  if (!worthKeeping(versions, blocks)) return;

  const now = Date.now();
  const id = push(ref(rtdb, historyPath(documentId))).key!;
  const entry = describeVersion(blocks, Date.parse(data.lastUpdated ?? "") || now);
  const changes: Record<string, unknown> = {
    owner: data.owner,
    ["index/" + id]: entry,
    ["versions/" + id]: data.content,
  };
  for (const old of versionsToDrop({...versions, [id]: entry}, now)) {
    changes["index/" + old] = null;
    changes["versions/" + old] = null;
  }
  await update(ref(rtdb, historyPath(documentId)), changes);
}
