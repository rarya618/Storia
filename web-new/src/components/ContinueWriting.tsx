import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onValue } from "firebase/database";

import { Project } from "../datatypes/Block";
import Document from "../datatypes/Document";
import { getDocumentRef } from "../firebase/database";
import { readBlocks } from "../screenplay/content";
import { byLatest } from "../misc/sortBlocks";
import { CastLine, Sheet, Stats } from "./Sheet";
import { describe, documentWhen } from "../screenplay/describe";
import StrokeIcon from "./screenplay/StrokeIcon";

// the sheet's frame, shared with the slab that holds its place while it loads
const frame = "h-[220px] w-full shrink-0 sm:h-[320px] sm:w-[300px]";

// home's way back into the writing: the latest draft of the most recently
// updated project, as its own first page, one click from the editor
const ContinueWriting = ({project, folderName}: {project: Project, folderName?: string | null}) => {
  const ids = Object.keys(project.documents ?? {});
  const idKey = ids.join(",");
  // undefined while loading, null when it couldn't be read
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

  // choose only once every document has arrived, so the draft never swaps under a click
  const settled = ids.every(id => id in docs);
  const latest = settled ? byLatest(Object.values(docs).filter((doc): doc is Document => !!doc))[0] : undefined;
  if (settled && !latest) return null;

  return (
    <section aria-labelledby="continue">
      <h2 id="continue" className="sw-ruled sw-label mb-4"><span>Where you left off</span></h2>
      {!latest ? (
        <div className={frame + " rounded-[8px] border border-[color:var(--hair)] bg-[color:var(--tint)]"} aria-label="Loading your latest draft" role="status" />
      ) : (() => {
        const blocks = readBlocks(latest.content);
        const {pages, scenes, runtime, cast} = describe(blocks);
        return (
          <Link to={"/document/" + latest.id} className="group flex flex-col gap-5 rounded-[8px] focus-visible:!rounded-[8px] sm:flex-row sm:items-start sm:gap-8">
            <Sheet blocks={blocks} large frame={frame} />
            <div className="min-w-0 max-w-md sm:pt-3">
              <p className="break-words text-xl font-semibold tracking-tight text-[color:var(--on-select)]">{latest.name}</p>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-[color:var(--muted)]">
                <span className="truncate">{project.name}</span>
                {folderName && <>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0"><StrokeIcon name="folder" size={14} /></span>
                  <span className="truncate">{folderName}</span>
                </>}
              </p>
              {latest.description && <p className="mt-3 line-clamp-3 break-words text-sm text-[color:var(--muted)]">{latest.description}</p>}
              <Stats pages={pages} scenes={scenes} runtime={runtime} className="mt-4 text-sm" />
              <CastLine cast={cast} className="mt-1.5 text-sm" />
              <p className="mt-1.5 text-sm text-[color:var(--muted)]">{documentWhen(latest)}</p>
              <span className="sw-button sw-button-soft mt-5">Continue writing</span>
            </div>
          </Link>
        );
      })()}
    </section>
  );
};

export default ContinueWriting;
