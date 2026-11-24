import { FormEvent, useRef, useState } from "react";
import { get } from "firebase/database";
import { useModal } from "../../misc/modal";
import { toMessage } from "../../misc/errors";
import { randomString } from "../../misc/randomString";
import { actsInScript, Board, ensureAct, orderActs, removeAct, renameAct, sameName } from "../../board/board";
import { getDocumentRef } from "../../firebase/database";
import { readBlocks } from "../../screenplay/content";
import { titleCase } from "../screenplay/cast";
import StrokeIcon from "../screenplay/StrokeIcon";
import "../../screenplay/world.css";

type Row = {id: string, name: string, removed: boolean, isNew: boolean};

type ActsDialogProps = {
  board: Board,
  // the project's drafts, whose act breaks can fill the acts in
  drafts: {id: string, name: string}[],
  apply: (change: (board: Board) => Board) => Promise<void>,
  onClose: () => void,
};

// Acts: the board's acts in order, to rename, add, reorder and remove in one
// go, or to fill in from a draft's act breaks. Removing an act keeps its cards,
// which move ahead of the acts, in no act
const ActsDialog = ({board, drafts, apply, onClose}: ActsDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModal(dialogRef, onClose);

  const [rows, setRows] = useState<Row[]>(() => board.acts.map(act => ({...act, removed: false, isNew: false})));
  const [adding, setAdding] = useState("");
  const [saving, setSaving] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string>();
  const [note, setNote] = useState<string>();

  const edit = (id: string, changes: Partial<Row>) =>
    setRows(current => current.map(row => row.id === id ? {...row, ...changes} : row));

  const move = (id: string, by: -1 | 1) => setRows(current => {
    const from = current.findIndex(row => row.id === id);
    const to = from + by;
    if (to < 0 || to >= current.length) return current;
    const next = [...current];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  });

  const taken = (name: string, list = rows) => list.some(row => !row.removed && sameName(row.name, name));

  const add = () => {
    const name = adding.trim();
    if (!name) return;
    if (taken(name)) return setError("There's already an act called " + name);
    setRows(current => [...current, {id: randomString(12), name, removed: false, isNew: true}]);
    setAdding("");
    setError(undefined);
  };

  // the act breaks a draft opens, added after the acts already here
  const fillFrom = async (draftId: string) => {
    if (!draftId) return;
    setReading(true);
    setError(undefined);
    setNote(undefined);
    try {
      const snapshot = await get(getDocumentRef(draftId));
      const names = actsInScript(readBlocks(snapshot.val()?.content)).map(titleCase);
      const fresh = names.filter(name => !taken(name));
      if (names.length === 0) setNote("That draft has no act breaks yet");
      else if (fresh.length === 0) setNote("The board already has that draft's acts");
      else {
        setRows(current => [...current, ...fresh.map(name => ({id: randomString(12), name, removed: false, isNew: true}))]);
        setNote("Added " + fresh.join(", "));
      }
    } catch (failure) {
      setError("Couldn't read that draft: " + toMessage(failure));
    } finally {
      setReading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    // a name typed but not yet added counts as added
    const pending = adding.trim();
    const all = pending && !taken(pending) ? [...rows, {id: randomString(12), name: pending, removed: false, isNew: true}] : rows;
    const kept = all.filter(row => !row.removed);
    if (kept.some(row => !row.name.trim())) return setError("Every act needs a name");
    if (kept.some((row, index) => kept.findIndex(other => sameName(other.name, row.name)) !== index))
      return setError("Two acts can't share a name");

    setSaving(true);
    setError(undefined);
    try {
      await apply(current => {
        let next = current;
        for (const row of all) {
          if (row.removed) next = row.isNew ? next : removeAct(next, row.id);
          else if (row.isNew) next = ensureAct(next, row.name, row.id).board;
          else next = renameAct(next, row.id, row.name);
        }
        return orderActs(next, kept.map(row => row.id));
      });
      onClose();
    } catch (failure) {
      setError(toMessage(failure));
      setSaving(false);
    }
  };

  const visible = rows.filter(row => !(row.removed && row.isNew));
  const cardsIn = (id: string) => board.cards.filter(card => card.act === id).length;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="acts-dialog-title"
      className="sw sw-rev sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[480px] rounded-[12px] p-0"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <form className="px-6 pb-5 pt-5" onSubmit={submit} noValidate>
        <h2 id="acts-dialog-title" className="mb-1 text-lg font-bold">Acts</h2>
        <p className="mb-5 text-sm text-[color:var(--muted)]">The board is laid out act by act, in this order. Removing an act keeps its cards.</p>

        {visible.length > 0 && (
          <ol className="mb-4 flex flex-col gap-2" aria-label="Acts, in order">
            {visible.map((row, index) => (
              <li key={row.id} className="flex items-center gap-1.5">
                {row.removed ? (
                  <>
                    <span className="min-w-0 flex-1 truncate px-3 text-base text-[color:var(--muted)] line-through">{row.name}</span>
                    <button type="button" className="sw-button" onClick={() => edit(row.id, {removed: false})}>Undo</button>
                  </>
                ) : (
                  <>
                    <input
                      className="sw-input min-w-0 flex-1"
                      value={row.name}
                      onChange={event => { edit(row.id, {name: event.target.value}); setError(undefined); }}
                      aria-label={"Name of act " + (index + 1)}
                      autoComplete="off"
                    />
                    {!row.isNew && <span className="w-14 shrink-0 text-right text-sm tabular-nums text-[color:var(--muted)]">{cardsIn(row.id)} {cardsIn(row.id) === 1 ? "card" : "cards"}</span>}
                    <button type="button" className="sw-icon shrink-0" onClick={() => move(row.id, -1)} disabled={index === 0} aria-label={"Move " + row.name + " earlier"} title="Earlier">
                      <span className="rotate-180"><StrokeIcon name="chevronDown" size={16} /></span>
                    </button>
                    <button type="button" className="sw-icon shrink-0" onClick={() => move(row.id, 1)} disabled={index === visible.length - 1} aria-label={"Move " + row.name + " later"} title="Later">
                      <StrokeIcon name="chevronDown" size={16} />
                    </button>
                    <button type="button" className="sw-icon shrink-0" onClick={() => edit(row.id, {removed: true})} aria-label={"Remove " + row.name} title="Remove">
                      <StrokeIcon name="close" size={16} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}

        <div className="flex gap-2">
          <input
            className="sw-input min-w-0 flex-1"
            value={adding}
            onChange={event => { setAdding(event.target.value); setError(undefined); }}
            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); add(); } }}
            placeholder={visible.length ? "New act" : "Act One"}
            aria-label="New act"
            autoComplete="off"
            autoFocus
          />
          <button type="button" className="sw-button shrink-0" onClick={add} disabled={!adding.trim()}>
            <StrokeIcon name="plus" size={15} />Add
          </button>
        </div>

        {drafts.length > 0 && (
          <div className="mt-4">
            <label htmlFor="acts-from-draft" className="sw-label mb-1.5 block">Fill in from a draft's act breaks</label>
            <select
              id="acts-from-draft"
              className="sw-input"
              value=""
              disabled={reading}
              onChange={event => fillFrom(event.target.value)}
            >
              <option value="">{reading ? "Reading the draft…" : "Choose a draft"}</option>
              {drafts.map(draft => <option key={draft.id} value={draft.id}>{draft.name}</option>)}
            </select>
            {note && <p role="status" className="mt-2 text-sm text-[color:var(--muted)]">{note}</p>}
          </div>
        )}

        {error && <p role="alert" className="mt-3 text-sm text-[color:var(--signal)]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="sw-button sw-button-soft" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </dialog>
  );
};

export default ActsDialog;
