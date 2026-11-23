import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onValue } from "firebase/database";

import { Project } from "../datatypes/Block";
import Document from "../datatypes/Document";
import { getDocumentRef } from "../firebase/database";
import { readBlocks } from "../screenplay/content";
import { describe, documentWhen } from "../screenplay/describe";
import { inDraftOrder, ordinal, revisionAt, revisionStyle } from "../screenplay/revisions";
import { byLatest } from "../misc/sortBlocks";
import { CastLine, Sheet, Stats } from "./Sheet";
import StrokeIcon from "./screenplay/StrokeIcon";

// the stack's frame, shared with the slab that holds its place while it loads
const frame = "h-[260px] w-full sm:h-[340px] sm:w-[300px]";

// home's way back into the writing: the latest document of the most recently
// updated project, on its revision colour, with the ones before it fanned beneath
const ContinueWriting = ({project, folderName}: {project: Project, folderName?: string | null}) => {
  const ids = Object.keys(project.documents ?? {});
  const idKey = ids.join(",");
  // missing while loading, null when it couldn't be read
  const [docs, setDocs] = useState<Record<string, Document | null>>({});

  // the project stores only summaries, so its documents are read in full, as the project page does
  useEffect(() => {
    setDocs({});
    const unsubscribes = ids.map(id => onValue(getDocumentRef(id), (snapshot) => {
      setDocs(current => ({...current, [id]: snapshot.exists() ? {id, ...snapshot.val()} : null}));
    }, () => setDocs(current => ({...current, [id]: null}))));
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    // idKey stands in for ids, which is rebuilt every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey]);

  // choose only once every document has arrived, so the page never swaps under a click
  const settled = ids.every(id => id in docs);
  const readable = Object.values(docs).filter((doc): doc is Document => !!doc);
  const latest = settled ? byLatest(readable)[0] : undefined;
  if (settled && !latest) return null;

  return (
    <section aria-labelledby="continue">
      <h2 id="continue" className="sw-section mb-5"><span>Where you left off</span></h2>
      {!latest ? (
        <div className={frame + " rounded-[8px] bg-[color:var(--tint)]"} role="status" aria-label="Loading your latest document" />
      ) : (() => {
        const order = inDraftOrder(readable);
        // documents that couldn't be read still count, as blank slots after the rest
        const unread = ids.length - order.length;
        const position = order.findIndex(doc => doc.id === latest.id);
        const revision = revisionAt(position);
        // beneath it lie the two documents made before it, oldest at the back;
        // a first draft lies over its own next pages instead
        const under = [position - 2, position - 1].map(index => index >= 0 ? revisionAt(index) : revision);
        const blocks = readBlocks(latest.content);
        const {pages, scenes, runtime, cast} = describe(blocks);

        return (
          <Link to={"/document/" + latest.id} className="group flex flex-col gap-8 rounded-[10px] focus-visible:!rounded-[10px] sm:flex-row sm:items-start sm:gap-12">
            <div className="shrink-0 pb-4 pr-6">
              <div className={"sw-stack " + frame}>
                {under.map((below, index) => <span key={index} className="sw-stack-under" style={revisionStyle(below)} aria-hidden="true" />)}
                <Sheet blocks={blocks} large revision={revision} frame="" />
              </div>
            </div>

            <div className="min-w-0 max-w-xl sm:pt-1">
              <p className="break-words text-3xl font-bold tracking-tight">{latest.name}</p>
              <p className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 text-base text-[color:var(--muted)]">
                <span>{project.name}</span>
                {folderName && <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5"><StrokeIcon name="folder" size={16} />{folderName}</span>
                </>}
                <span aria-hidden="true">·</span>
                <span>{documentWhen(latest)}</span>
              </p>
              {latest.description && <p className="mt-3 line-clamp-3 break-words text-base">{latest.description}</p>}
              <Stats pages={pages} scenes={scenes} runtime={runtime} className="mt-5 text-base" />
              <CastLine cast={cast} className="mt-2 text-base" />

              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
                  {ids.length > 1 && (
                    <p className="sw-rev-strip" aria-label={"Documents in this project, oldest first: " + order.map((_, index) => revisionAt(index).name).join(", ") + (unread > 0 ? ", and " + unread + " that couldn't be read" : "")}>
                      {order.map((doc, index) => (
                        <i key={doc.id} style={revisionStyle(revisionAt(index))} aria-current={doc.id === latest.id ? "true" : undefined} title={doc.name + ": " + revisionAt(index).name + " pages"} />
                      ))}
                      {Array.from({length: unread}, (_, index) => <i key={"unread" + index} className="unread" title="Couldn't be read" />)}
                    </p>
                  )}
                  <span className="sw-rev-chip" style={revisionStyle(revision)}>{revision.name} pages</span>
                  <span className="text-[color:var(--muted)]">{ordinal(position + 1)} of {ids.length} in {project.name}</span>
                </div>
                <p className="mt-2 max-w-md text-sm text-[color:var(--muted)]">Each new document gets the next colour, the way a production prints each round of changes.</p>
              </div>

              <span className="sw-button sw-button-soft mt-6 !h-12 !px-6 !text-base">Continue writing</span>
            </div>
          </Link>
        );
      })()}
    </section>
  );
};

export default ContinueWriting;
