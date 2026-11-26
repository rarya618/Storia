import { FormEvent, useRef, useState } from "react";
import { useModal } from "../../misc/modal";
import { toMessage } from "@storia/core/misc/errors";
import { randomString } from "@storia/core/misc/randomString";
import { Board, countIn, ensureGroup, removeGroup, renameGroup, sameName } from "@storia/core/board/board";
import StrokeIcon from "../screenplay/StrokeIcon";
import "../../screenplay/world.css";

type Row = {id: string, name: string, removed: boolean, isNew: boolean};

type GroupsDialogProps = {
  board: Board,
  apply: (change: (board: Board) => Board) => Promise<void>,
  onClose: () => void,
};

// Groups: rename, add and remove the board's groups in one go. Removing a
// group keeps its cards; they just stop being filed under it
const GroupsDialog = ({board, apply, onClose}: GroupsDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModal(dialogRef, onClose);

  const [rows, setRows] = useState<Row[]>(() => board.groups.map(group => ({...group, removed: false, isNew: false})));
  const [adding, setAdding] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const edit = (id: string, changes: Partial<Row>) =>
    setRows(current => current.map(row => row.id === id ? {...row, ...changes} : row));

  const add = () => {
    const name = adding.trim();
    if (!name) return;
    if (rows.some(row => !row.removed && sameName(row.name, name))) {
      setError("There's already a group called " + name);
      return;
    }
    setRows(current => [...current, {id: randomString(12), name, removed: false, isNew: true}]);
    setAdding("");
    setError(undefined);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    // a name typed but not yet added counts as added
    const pending = adding.trim();
    const all = pending ? [...rows, {id: randomString(12), name: pending, removed: false, isNew: true}] : rows;
    const kept = all.filter(row => !row.removed);
    if (kept.some(row => !row.name.trim())) return setError("Every group needs a name");
    if (kept.some((row, index) => kept.findIndex(other => sameName(other.name, row.name)) !== index))
      return setError("Two groups can't share a name");

    setSaving(true);
    setError(undefined);
    try {
      await apply(current => {
        let next = current;
        for (const row of all) {
          if (row.removed) next = row.isNew ? next : removeGroup(next, row.id);
          else if (row.isNew) next = ensureGroup(next, row.name, row.id).board;
          else next = renameGroup(next, row.id, row.name);
        }
        return next;
      });
      onClose();
    } catch (failure) {
      setError(toMessage(failure));
      setSaving(false);
    }
  };

  const visible = rows.filter(row => !(row.removed && row.isNew));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="groups-dialog-title"
      className="sw sw-rev sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[440px] rounded-[12px] p-0"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <form className="px-6 pb-5 pt-5" onSubmit={submit} noValidate>
        <h2 id="groups-dialog-title" className="mb-1 text-lg font-bold">Groups</h2>
        <p className="mb-5 text-sm text-[color:var(--muted)]">File cards under a subplot, an act or a character. Removing a group keeps its cards.</p>

        {visible.length > 0 && (
          <ul className="mb-4 flex flex-col gap-2" aria-label="Groups on this board">
            {visible.map(row => (
              <li key={row.id} className="flex items-center gap-2">
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
                      aria-label={"Name of group " + row.name}
                      autoComplete="off"
                    />
                    {!row.isNew && <span className="w-16 shrink-0 text-right text-sm tabular-nums text-[color:var(--muted)]">{countIn(board, row.id)} {countIn(board, row.id) === 1 ? "card" : "cards"}</span>}
                    <button type="button" className="sw-icon shrink-0" onClick={() => edit(row.id, {removed: true})} aria-label={"Remove " + row.name} title="Remove">
                      <StrokeIcon name="close" size={16} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            className="sw-input min-w-0 flex-1"
            value={adding}
            onChange={event => { setAdding(event.target.value); setError(undefined); }}
            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); add(); } }}
            placeholder="New group"
            aria-label="New group"
            autoComplete="off"
            autoFocus
          />
          <button type="button" className="sw-button shrink-0" onClick={add} disabled={!adding.trim()}>
            <StrokeIcon name="plus" size={15} />Add
          </button>
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-[color:var(--signal)]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="sw-button sw-button-soft" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </dialog>
  );
};

export default GroupsDialog;
