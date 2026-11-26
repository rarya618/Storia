import { get, push, ref, update } from "@react-native-firebase/database";
import { readBlocks } from "@storia/core/screenplay/content";
import { Versions, describeVersion, versionsToDrop, worthKeeping } from "@storia/core/screenplay/history";
import { rtdb } from "./main";

// Draft history, as web's firebase/history.tsx keeps it (keep the two in step):
// history/{documentId} holds the owner, index/{versionId} (a VersionEntry) and
// versions/{versionId} (that copy's content). The phone only keeps versions;
// they're seen and restored on the web.

const historyPath = (documentId: string) => "history/" + documentId;

// keep the script as it's stored now as a version, before a save replaces it.
// It reads the stored copy rather than taking the screen's, so what the web
// saved since this script opened is the one kept. Nothing is written when the
// newest version already holds it, and the versions past keeping go in the same update
export async function keepVersion(documentId: string) {
  const [stored, index] = await Promise.all([
    get(ref(rtdb, "documents/" + documentId)),
    get(ref(rtdb, historyPath(documentId) + "/index")),
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
