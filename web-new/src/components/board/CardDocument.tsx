import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Node as PMNode } from "prosemirror-model";
import { Board, BoardCard, ensureGroup, placeCard, placeInAct, removeCard, updateCard } from "@storia/core/board/board";
import { BodyJSON, bodyJSON, readBody, textOfBody } from "../../board/body";
import { changeBoard } from "../../firebase/database";
import { randomString } from "@storia/core/misc/randomString";
import { toMessage } from "../../misc/errors";
import ConfirmDelete from "../ConfirmDelete";
import StrokeIcon from "../screenplay/StrokeIcon";
import BodyEditor from "./BodyEditor";
import PropertyRows from "./PropertyRows";
import PropertiesDialog from "./PropertiesDialog";

type Words = Partial<{title: string, text: string, body: BodyJSON}>;
type Status = "saved" | "saving" | "failed";

// how long typing rests before it's written
const SAVE_AFTER_MS = 600;

// one row of the card's details: a quiet label, then its value
export const PropRow = ({label, htmlFor, children}: {label: string, htmlFor?: string, children: ReactNode}) => (
  <div className="sw-prop">
    {htmlFor ? <label htmlFor={htmlFor} className="sw-prop-label">{label}</label> : <span className="sw-prop-label">{label}</span>}
    <div className="sw-prop-value">{children}</div>
  </div>
);

type CardDocumentProps = {
  projectId: string,
  board: Board,
  card: BoardCard,
  // more detail rows from the screen (the script links, the board's own properties)
  extraRows?: ReactNode,
  // a new, blank card starts with the caret in its title
  startInTitle?: boolean,
  onDeleted: () => void,
};

// A card as a page: its title, its details (act, place, groups and more) as
// rows, then its body, a short rich document. Mount it keyed by the card's id:
// the title and body are the writer's while they type, and are written after a
// pause, through transactions, so a copy arriving from elsewhere never
// overwrites them. Details are written at once
const CardDocument = ({projectId, board, card, extraRows, startInTitle, onDeleted}: CardDocumentProps) => {
  const [title, setTitle] = useState(card.title);
  const [initialBody] = useState(() => readBody(card.body, card.text));
  const [status, setStatus] = useState<Status>("saved");
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [addingGroup, setAddingGroup] = useState<string>();
  const [managing, setManaging] = useState(false);
  const pending = useRef<Words>({});
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const focusBody = useRef<() => void>();
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const write = (change: (board: Board) => Board) =>
    changeBoard(projectId, change).catch(failure => { setError(toMessage(failure)); throw failure; });

  // write whatever's waiting; what fails stays waiting for the next try
  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    const words = pending.current;
    if (Object.keys(words).length === 0) return;
    pending.current = {};
    setStatus("saving");
    try {
      await changeBoard(projectId, current => updateCard(current, card.id, words));
      setStatus(Object.keys(pending.current).length ? "saving" : "saved");
      setError(undefined);
    } catch (failure) {
      pending.current = {...words, ...pending.current};
      setStatus("failed");
      setError(toMessage(failure));
    }
  }, [projectId, card.id]);

  const queue = (words: Words) => {
    pending.current = {...pending.current, ...words};
    setStatus("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_AFTER_MS);
  };

  // leaving the card, or the page, writes what's waiting
  useEffect(() => {
    const onHide = () => { flush(); };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flush();
    };
  }, [flush]);

  // a title that grows with what's typed. Measured again on the next frame,
  // since in the side peek it mounts before its dialog has opened, when it has
  // no size to measure (the CSS keeps it a line tall meanwhile)
  useEffect(() => {
    const fit = () => {
      const field = titleRef.current;
      if (!field || field.scrollHeight === 0) return;
      field.style.height = "auto";
      field.style.height = field.scrollHeight + "px";
    };
    fit();
    const frame = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(frame);
  }, [title]);

  // a new card's caret starts in its title. Inside Shell the screen can still be
  // hidden for a moment while it's revealed, and a hidden field can't take
  // focus, so keep trying for a few frames until it does
  useEffect(() => {
    if (!startInTitle) return;
    let frame = 0;
    let tries = 0;
    const attempt = () => {
      const field = titleRef.current;
      if (!field) return;
      field.focus();
      if (document.activeElement !== field && tries++ < 40) frame = requestAnimationFrame(attempt);
    };
    attempt();
    return () => cancelAnimationFrame(frame);
  }, [startInTitle]);

  const onBody = (doc: PMNode) => queue({body: bodyJSON(doc), text: textOfBody(doc)});

  if (confirming) {
    return (
      <ConfirmDelete
        noun="card"
        name={title.trim() || "Untitled"}
        message="The card and its page go for good. This can't be undone. Its act and groups stay."
        onConfirm={async () => {
          clearTimeout(timer.current);
          pending.current = {};
          await changeBoard(projectId, current => removeCard(current, card.id));
          onDeleted();
        }}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  const inAct = board.cards.filter(other => other.act === card.act);
  const place = placeInAct(board, card.id);
  const groups = new Set(card.groups ?? []);
  const toggleGroup = (id: string) => write(current => updateCard(current, card.id, {
    groups: groups.has(id) ? [...groups].filter(other => other !== id) : [...groups, id],
  })).catch(() => {});
  const addGroup = (name: string) => {
    const id = randomString(12);
    setAddingGroup(undefined);
    write(current => {
      const added = ensureGroup(current, name, id);
      const existing = current.cards.find(other => other.id === card.id)?.groups ?? [];
      return added.id ? updateCard(added.board, card.id, {groups: [...new Set([...existing, added.id])]}) : current;
    }).catch(() => {});
  };

  return (
    <article className="sw-card-page">
      <div className="mb-3 flex items-center gap-3 text-sm text-[color:var(--muted)]">
        <span className="tabular-nums">Card {board.cards.findIndex(other => other.id === card.id) + 1} of {board.cards.length}</span>
        <span className="flex-1" />
        <span role="status" className={status === "failed" ? "text-[color:var(--signal)]" : undefined}>
          {status === "saving" ? "Saving…" : status === "failed" ? "Couldn't save" : "Saved"}
        </span>
        {status === "failed" && <button type="button" className="font-bold text-[color:var(--ui)] underline underline-offset-4" onClick={flush}>Retry</button>}
        <button type="button" className="sw-icon" onClick={() => setConfirming(true)} aria-label="Delete card" title="Delete card">
          <StrokeIcon name="trash" size={16} />
        </button>
      </div>

      <textarea
        ref={titleRef}
        className="sw-card-title"
        rows={1}
        value={title}
        placeholder="Untitled"
        aria-label="Card title"
        onChange={event => { setTitle(event.target.value.replace(/\n/g, " ")); queue({title: event.target.value.replace(/\n/g, " ")}); }}
        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); focusBody.current?.(); } }}
      />

      <div className="sw-props">
        <PropRow label="Act" htmlFor={"card-act-" + card.id}>
          {board.acts.length > 0 ? (
            <select
              id={"card-act-" + card.id}
              className="sw-prop-select"
              value={card.act ?? ""}
              onChange={event => write(current => placeCard(current, card.id, event.target.value || undefined)).catch(() => {})}
            >
              <option value="">No act</option>
              {board.acts.map(act => <option key={act.id} value={act.id}>{act.name}</option>)}
            </select>
          ) : <span className="text-[color:var(--muted)]">No acts on this board yet</span>}
        </PropRow>

        {inAct.length > 1 && (
          <PropRow label="Place" htmlFor={"card-place-" + card.id}>
            <select
              id={"card-place-" + card.id}
              className="sw-prop-select"
              value={place + 1}
              onChange={event => write(current => placeCard(current, card.id, card.act, Number(event.target.value) - 1)).catch(() => {})}
            >
              {inAct.map((_, index) => <option key={index} value={index + 1}>{index + 1} of {inAct.length}{card.act ? " in the act" : ""}</option>)}
            </select>
          </PropRow>
        )}

        <PropRow label="Groups">
          <div className="flex flex-wrap items-center gap-1.5">
            {board.groups.map(group => (
              <button key={group.id} type="button" className="sw-filter sw-filter-small" aria-pressed={groups.has(group.id)} onClick={() => toggleGroup(group.id)}>
                <span className="truncate">{group.name}</span>
              </button>
            ))}
            {addingGroup === undefined ? (
              <button type="button" className="sw-prop-add" onClick={() => setAddingGroup("")}>
                <StrokeIcon name="plus" size={14} />{board.groups.length ? "New" : "Add a group"}
              </button>
            ) : (
              <input
                className="sw-input !h-8 !w-40 !py-1 !text-sm"
                value={addingGroup}
                autoFocus
                placeholder="Group name"
                aria-label="New group"
                onChange={event => setAddingGroup(event.target.value)}
                onBlur={() => addingGroup.trim() ? addGroup(addingGroup) : setAddingGroup(undefined)}
                onKeyDown={event => {
                  if (event.key === "Enter") { event.preventDefault(); if (addingGroup.trim()) addGroup(addingGroup); }
                  if (event.key === "Escape") { event.stopPropagation(); setAddingGroup(undefined); }
                }}
              />
            )}
          </div>
        </PropRow>

        {extraRows}

        <PropertyRows board={board} card={card} write={change => { write(change).catch(() => {}); }} onManage={() => setManaging(true)} />
      </div>

      {managing && <PropertiesDialog board={board} apply={change => changeBoard(projectId, change)} onClose={() => setManaging(false)} />}

      {error && <p role="alert" className="mb-4 text-sm text-[color:var(--signal)]">{error}</p>}

      <BodyEditor
        initial={initialBody}
        onChange={onBody}
        label={"Page of " + (title.trim() || "untitled card")}
        onReady={focus => { focusBody.current = focus; }}
      />
    </article>
  );
};

export default CardDocument;
