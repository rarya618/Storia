import { CSSProperties, Fragment, useEffect, useRef, useState } from "react";
import { get } from "firebase/database";
import { ScriptBlock } from "@storia/core/screenplay/types";
import { VersionEntry, Versions, newestFirst } from "@storia/core/screenplay/history";
import { toMessage } from "@storia/core/misc/errors";
import { getVersionContent, getVersionsRef } from "../../firebase/history";
import { useModal } from "../../misc/modal";
import StrokeIcon from "./StrokeIcon";

type HistoryDialogProps = {
  documentId: string,
  name: string,
  // keeps the script as it is now, then puts this version on the page
  onRestore: (blocks: ScriptBlock[]) => Promise<void>,
  onClose: () => void,
};

const WIDE = "(min-width: 768px)";

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const dayLabel = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long", day: "numeric", month: "long",
    ...(date.getFullYear() === today.getFullYear() ? {} : {year: "numeric"}),
  });
};

const timeLabel = (date: Date) => date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});

const plural = (n: number, one: string) => n.toLocaleString() + " " + one + (n === 1 ? "" : "s");

const describe = (version: VersionEntry) => plural(version.pages, "page") + " · " + plural(version.words, "word");

// the versions grouped under their day, newest first
const byDay = (versions: Versions) => {
  const days: {label: string, versions: [string, VersionEntry][]}[] = [];
  for (const [id, version] of newestFirst(versions)) {
    const label = dayLabel(new Date(version.savedAt));
    if (days[days.length - 1]?.label !== label) days.push({label, versions: []});
    days[days.length - 1].versions.push([id, version]);
  }
  return days;
};

// the dot menu's History: the copies kept of this script (firebase/history),
// a day at a time, each opening as a read-only page beside the list, with
// Restore. On a phone the list and the page take turns
const HistoryDialog = ({documentId, name, onRestore, onClose}: HistoryDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModal(dialogRef, onClose);

  const [versions, setVersions] = useState<Versions>();
  const [listError, setListError] = useState<string>();
  const [selected, setSelected] = useState<string>();
  const [contents, setContents] = useState<Record<string, ScriptBlock[]>>({});
  const [previewError, setPreviewError] = useState<string>();
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    get(getVersionsRef(documentId)).then(snapshot => {
      if (cancelled) return;
      const found: Versions = snapshot.val() ?? {};
      setVersions(found);
      // beside the list, the newest opens at once; a phone waits for a choice
      const newest = newestFirst(found)[0];
      if (newest && window.matchMedia(WIDE).matches) setSelected(newest[0]);
    }).catch(error => !cancelled && setListError(toMessage(error)));
    return () => { cancelled = true; };
  }, [documentId]);

  useEffect(() => {
    if (!selected || contents[selected]) return;
    let cancelled = false;
    setPreviewError(undefined);
    getVersionContent(documentId, selected)
      .then(blocks => !cancelled && setContents(loaded => ({...loaded, [selected]: blocks})))
      .catch(error => !cancelled && setPreviewError(toMessage(error)));
    return () => { cancelled = true; };
  }, [documentId, selected, contents]);

  const preview = selected ? contents[selected] : undefined;
  const chosen = selected && versions ? versions[selected] : undefined;

  const restore = async () => {
    if (!preview || restoring) return;
    setRestoring(true);
    setRestoreError(undefined);
    try {
      await onRestore(preview);
    } catch (error) {
      setRestoreError(toMessage(error));
      setRestoring(false);
    }
  };

  const days = versions ? byDay(versions) : [];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="history-title"
      className="sw sw-rev sw-float sw-dialog m-auto h-[min(760px,calc(100%-32px))] w-[calc(100%-32px)] max-w-[1040px] rounded-[12px] p-0"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="flex h-full flex-col">
        <header className="border-b border-[color:var(--hair)] px-6 pb-4 pt-5">
          <h2 id="history-title" className="break-words text-lg font-bold">History of “{name}”</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Storia keeps a copy each time you come back to this script, and every ten minutes while you write.
          </p>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* the versions; on a phone, hidden while one is open */}
          <nav aria-label="Versions" className={"min-h-0 w-full shrink-0 overflow-y-auto px-3 py-3 md:w-[280px] md:border-r md:border-[color:var(--hair)]" + (selected ? " max-md:hidden" : "")}>
            {listError ? (
              <p role="alert" className="px-3 py-2 text-sm text-[color:var(--signal)]">{listError}</p>
            ) : !versions ? (
              <div className="flex justify-center py-10"><span className="sw-spinner" aria-hidden="true" /><span className="sr-only">Loading</span></div>
            ) : days.length === 0 ? (
              <p className="px-3 py-2 text-base text-[color:var(--muted)]">No earlier versions yet. The first is kept as soon as you change something.</p>
            ) : days.map(day => (
              <Fragment key={day.label}>
                <h3 className="px-3 pb-1 pt-3 text-sm font-bold text-[color:var(--muted)] first:pt-1">{day.label}</h3>
                <ul>
                  {day.versions.map(([id, version]) => (
                    <li key={id}>
                      <button
                        type="button"
                        className="sw-row flex w-full flex-col items-start px-3 py-2 text-left"
                        aria-current={id === selected ? "true" : undefined}
                        onClick={() => setSelected(id)}
                      >
                        <span className="text-base font-bold">{timeLabel(new Date(version.savedAt))}</span>
                        <span className="sw-row-meta text-sm">{describe(version)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Fragment>
            ))}
          </nav>

          {/* the chosen version, as a page you can read but not edit */}
          <section aria-label="Preview" className={"min-h-0 min-w-0 flex-1 overflow-y-auto" + (selected ? "" : " max-md:hidden")}>
            {selected && (
              <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[color:var(--hair)] bg-[color:var(--paper)] px-3 py-2 md:hidden">
                <button type="button" className="sw-icon" onClick={() => setSelected(undefined)} aria-label="All versions" title="All versions">
                  <StrokeIcon name="back" />
                </button>
                {chosen && <span className="min-w-0 truncate text-sm font-bold">{dayLabel(new Date(chosen.savedAt))}, {timeLabel(new Date(chosen.savedAt))}</span>}
              </div>
            )}
            {previewError ? (
              <p role="alert" className="px-6 py-4 text-sm text-[color:var(--signal)]">{previewError}</p>
            ) : selected && !preview ? (
              <div className="flex justify-center py-16"><span className="sw-spinner" aria-hidden="true" /><span className="sr-only">Loading</span></div>
            ) : preview ? (
              <div className="px-4 pb-10">
                <div className="sp-page mx-auto" style={{"--sp-size": "14px"} as CSSProperties}>
                  <div className="sp-pm">
                    {preview.map(block => (
                      <p key={block.id} className={"sp-block sp-" + block.type}>{block.text || " "}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-[color:var(--hair)] px-6 py-4">
          {restoreError
            ? <p role="alert" className="mr-auto text-sm text-[color:var(--signal)]">{restoreError}</p>
            : preview && <p className="mr-auto text-sm text-[color:var(--muted)]">Your script as it is now is kept here first.</p>}
          <div className="flex gap-2">
            <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
            <button type="button" className="sw-button sw-button-soft" onClick={restore} disabled={!preview || restoring}>
              {restoring ? "Restoring…" : "Restore this version"}
            </button>
          </div>
        </footer>
      </div>
    </dialog>
  );
};

export default HistoryDialog;
