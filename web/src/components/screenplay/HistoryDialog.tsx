import { CSSProperties, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { get } from "firebase/database";
import { ElementType, ScriptBlock } from "@storia/core/screenplay/types";
import { VersionEntry, Versions, describeVersion, newestFirst } from "@storia/core/screenplay/history";
import { DiffLine, diffScripts, diffStats } from "@storia/core/screenplay/diff";
import { toMessage } from "@storia/core/misc/errors";
import { getVersionContent, getVersionsRef } from "../../firebase/history";
import { useModal } from "../../misc/modal";
import StrokeIcon from "./StrokeIcon";

type HistoryDialogProps = {
  documentId: string,
  name: string,
  // the script on the page now, listed first as the current version
  current: ScriptBlock[],
  // keeps the script as it is now, then puts this version on the page
  onRestore: (blocks: ScriptBlock[]) => Promise<void>,
  onClose: () => void,
};

const WIDE = "(min-width: 768px)";
const CURRENT = "current";

const ELEMENT_NAMES: Record<ElementType, string> = {
  heading: "scene heading", action: "action", character: "character", parenthetical: "parenthetical",
  dialogue: "dialogue", transition: "transition", shot: "shot", act: "act break", lyrics: "lyrics", note: "note",
};

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
const whenLabel = (version: VersionEntry) => {
  const date = new Date(version.savedAt);
  return dayLabel(date) + ", " + timeLabel(date);
};

const plural = (n: number, one: string) => n.toLocaleString() + " " + one + (n === 1 ? "" : "s");

const describe = (version: VersionEntry) => plural(version.pages, "page") + " · " + plural(version.words, "word");

// the kept versions grouped under their day, newest first
const byDay = (versions: [string, VersionEntry][]) => {
  const days: {label: string, versions: [string, VersionEntry][]}[] = [];
  for (const [id, version] of versions) {
    const label = dayLabel(new Date(version.savedAt));
    if (days[days.length - 1]?.label !== label) days.push({label, versions: []});
    days[days.length - 1].versions.push([id, version]);
  }
  return days;
};

// what the version changed since the one before it
const changeSummary = (lines: DiffLine[], since: VersionEntry) => {
  const {added, removed, changedLines} = diffStats(lines);
  if (changedLines === 0) return "No changes since " + whenLabel(since);
  const words = [added > 0 && plural(added, "word") + " added", removed > 0 && plural(removed, "word") + " removed"].filter(Boolean);
  return (words.length > 0 ? words.join(", ") : plural(changedLines, "line") + " changed") + " since " + whenLabel(since);
};

// a line of the preview: with its changes, added words on Wash and underlined,
// removed ones struck through, and the line starred in the margin (world.css)
const PreviewLine = ({line}: {line: DiffLine}) => {
  if (line.change === "removed" && line.segments.length === 0) return null;
  const marked = Boolean(line.change) && line.segments.length > 0;
  return (
    <p className={"sp-block sp-" + line.type + (marked ? " sp-changed" : "")}>
      {line.segments.length === 0 ? " " : line.segments.map((segment, index) =>
        segment.change === "added" ? <ins key={index}>{segment.text}</ins>
          : segment.change === "removed" ? <del key={index}>{segment.text}</del>
          : <Fragment key={index}>{segment.text}</Fragment>
      )}
      {line.was && <span className="sr-only"> (was {ELEMENT_NAMES[line.was]})</span>}
    </p>
  );
};

// the dot menu's History: the script as it is now, then the copies kept of it
// (firebase/history) a day at a time. Each opens as a read-only page beside the
// list, showing what it changed since the version before it, with Restore. On
// a phone the list and the page take turns
const HistoryDialog = ({documentId, name, current, onRestore, onClose}: HistoryDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  useModal(dialogRef, onClose);

  const [versions, setVersions] = useState<Versions>();
  const [listError, setListError] = useState<string>();
  // a phone opens on the list; beside it, the current version opens at once
  const [selected, setSelected] = useState<string | undefined>(() => window.matchMedia(WIDE).matches ? CURRENT : undefined);
  const [contents, setContents] = useState<Record<string, ScriptBlock[]>>(() => ({[CURRENT]: current}));
  const [previewError, setPreviewError] = useState<string>();
  const [showChanges, setShowChanges] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    get(getVersionsRef(documentId))
      .then(snapshot => !cancelled && setVersions(snapshot.val() ?? {}))
      .catch(error => !cancelled && setListError(toMessage(error)));
    return () => { cancelled = true; };
  }, [documentId]);

  // the current version, then the kept ones, newest first; each is compared with the one after it
  const currentEntry = useMemo(() => describeVersion(current, Date.now()), [current]);
  const kept = useMemo(() => versions ? newestFirst(versions) : [], [versions]);
  const order = useMemo(() => [CURRENT, ...kept.map(([id]) => id)], [kept]);
  const entryOf = (id: string) => id === CURRENT ? currentEntry : versions?.[id];
  const position = selected ? order.indexOf(selected) : -1;
  const base = position >= 0 && versions ? order[position + 1] : undefined;

  // load the chosen version, and the one before it to compare with
  useEffect(() => {
    const wanted = [selected, showChanges ? base : undefined]
      .filter((id): id is string => Boolean(id) && !contents[id!]);
    if (wanted.length === 0) return;
    let cancelled = false;
    setPreviewError(undefined);
    Promise.all(wanted.map(async id => [id, await getVersionContent(documentId, id)] as const))
      .then(loaded => !cancelled && setContents(known => ({...known, ...Object.fromEntries(loaded)})))
      .catch(error => !cancelled && setPreviewError(toMessage(error)));
    return () => { cancelled = true; };
  }, [documentId, selected, base, showChanges, contents]);

  const preview = selected ? contents[selected] : undefined;
  const before = base ? contents[base] : undefined;
  const lines = useMemo<DiffLine[] | undefined>(() => {
    if (!preview) return undefined;
    if (showChanges && before) return diffScripts(before, preview);
    if (showChanges && base) return undefined;
    return preview.map(block => ({type: block.type, segments: block.text ? [{text: block.text}] : []}));
  }, [preview, before, base, showChanges]);

  // open at the first change
  useEffect(() => {
    const page = previewRef.current;
    if (!page || !lines) return;
    const first = showChanges ? page.querySelector(".sp-changed") : null;
    if (first) first.scrollIntoView({block: "center"});
    else page.scrollTop = 0;
  }, [lines, showChanges]);

  const chosen = selected ? entryOf(selected) : undefined;
  const baseEntry = base ? entryOf(base) : undefined;
  const isCurrent = selected === CURRENT;

  const restore = async () => {
    if (!preview || isCurrent || restoring) return;
    setRestoring(true);
    setRestoreError(undefined);
    try {
      await onRestore(preview);
    } catch (error) {
      setRestoreError(toMessage(error));
      setRestoring(false);
    }
  };

  const days = byDay(kept);

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
            <button
              type="button"
              className="sw-row flex w-full flex-col items-start px-3 py-2 text-left"
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => setSelected(CURRENT)}
            >
              <span className="text-base font-bold">Current version</span>
              <span className="sw-row-meta text-sm">{describe(currentEntry)}</span>
            </button>
            {listError ? (
              <p role="alert" className="px-3 py-2 text-sm text-[color:var(--signal)]">{listError}</p>
            ) : !versions ? (
              <div className="flex justify-center py-10"><span className="sw-spinner" aria-hidden="true" /><span className="sr-only">Loading</span></div>
            ) : days.length === 0 ? (
              <p className="px-3 pt-4 text-sm text-[color:var(--muted)]">No earlier versions yet. The first is kept as soon as you change something.</p>
            ) : days.map(day => (
              <Fragment key={day.label}>
                <h3 className="px-3 pb-1 pt-4 text-sm font-bold text-[color:var(--muted)]">{day.label}</h3>
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
          <section ref={previewRef} aria-label="Preview" className={"min-h-0 min-w-0 flex-1 overflow-y-auto" + (selected ? "" : " max-md:hidden")}>
            {selected && (
              <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[color:var(--hair)] bg-[color:var(--paper)] py-2 pl-3 pr-4 md:pl-6">
                <button type="button" className="sw-icon shrink-0 md:hidden" onClick={() => setSelected(undefined)} aria-label="All versions" title="All versions">
                  <StrokeIcon name="back" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{isCurrent ? "Current version" : chosen && whenLabel(chosen)}</p>
                  <p className="truncate text-sm text-[color:var(--muted)]" aria-live="polite">
                    {!showChanges ? describe(chosen ?? currentEntry)
                      : !versions ? " "
                      : !baseEntry ? (isCurrent ? "Nothing kept yet to compare with" : "The oldest version kept")
                      : lines && before ? changeSummary(lines, baseEntry)
                      : " "}
                  </p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={showChanges} onChange={event => setShowChanges(event.target.checked)} className="sw-check h-[18px] w-[18px] cursor-pointer accent-[color:var(--ui)]" />
                  Show changes
                </label>
              </div>
            )}
            {previewError ? (
              <p role="alert" className="px-6 py-4 text-sm text-[color:var(--signal)]">{previewError}</p>
            ) : selected && !lines ? (
              <div className="flex justify-center py-16"><span className="sw-spinner" aria-hidden="true" /><span className="sr-only">Loading</span></div>
            ) : lines ? (
              <div className="px-4 pb-10">
                <div className="sp-page sp-diff mx-auto" style={{"--sp-size": "14px"} as CSSProperties}>
                  <div className="sp-pm">
                    {lines.map((line, index) => <PreviewLine key={index} line={line} />)}
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-[color:var(--hair)] px-6 py-4">
          {restoreError
            ? <p role="alert" className="mr-auto text-sm text-[color:var(--signal)]">{restoreError}</p>
            : isCurrent ? <p className="mr-auto text-sm text-[color:var(--muted)]">This is the script on the page now.</p>
            : preview && <p className="mr-auto text-sm text-[color:var(--muted)]">Your script as it is now is kept here first.</p>}
          <div className="flex gap-2">
            <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
            <button type="button" className="sw-button sw-button-soft" onClick={restore} disabled={!preview || isCurrent || restoring}>
              {restoring ? "Restoring…" : "Restore this version"}
            </button>
          </div>
        </footer>
      </div>
    </dialog>
  );
};

export default HistoryDialog;
