import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useModal } from "../../misc/modal";
import { toMessage } from "../../misc/errors";
import { randomString } from "../../misc/randomString";
import { addCard, Board, BoardCard, ensureGroup, isBlank, moveCard, removeCard, updateCard } from "../../board/board";
import ConfirmDelete from "../ConfirmDelete";
import "../../screenplay/world.css";

type CardDialogProps = {
  board: Board,
  // the card being edited; without one, the dialog adds a new card at the end
  card?: BoardCard,
  // a new card starts in the group the board is showing
  startGroup?: string,
  apply: (change: (board: Board) => Board) => Promise<void>,
  onClose: () => void,
};

// New card / Edit card: a title, the text, which groups it's in (or a new
// one), and, for a card that's there, its place in the story and Delete
const CardDialog = ({board, card, startGroup, apply, onClose}: CardDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useModal(dialogRef, onClose);

  const [title, setTitle] = useState(card?.title ?? "");
  const [text, setText] = useState(card?.text ?? "");
  const [groups, setGroups] = useState<string[]>(card?.groups ?? (startGroup ? [startGroup] : []));
  const [newGroup, setNewGroup] = useState("");
  const index = card ? board.cards.findIndex(existing => existing.id === card.id) : -1;
  const [position, setPosition] = useState(index + 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  // made once, so a transaction that runs again adds the same card, not a second
  const ids = useRef({card: randomString(12), group: randomString(12)});

  const toggleGroup = (id: string) =>
    setGroups(current => current.includes(id) ? current.filter(groupId => groupId !== id) : [...current, id]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (saving) return;
    if (isBlank({title, text})) {
      setError("Give the card a title or some text");
      document.getElementById("card-title")?.focus();
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      await apply(current => {
        let next = current;
        // groups deleted elsewhere in the meantime are left behind
        const chosen = groups.filter(id => next.groups.some(group => group.id === id));
        const added = ensureGroup(next, newGroup, ids.current.group);
        next = added.board;
        if (added.id && !chosen.includes(added.id)) chosen.push(added.id);

        if (!card) return addCard(next, {id: ids.current.card, title, text, groups: chosen});
        next = updateCard(next, card.id, {title, text, groups: chosen});
        return position - 1 === index ? next : moveCard(next, card.id, position - 1);
      });
      onClose();
    } catch (failure) {
      setError(toMessage(failure));
      setSaving(false);
    }
  };

  // ⌘/Ctrl+Enter saves from anywhere in the form, the text included
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  if (confirming && card) {
    return (
      <ConfirmDelete
        noun="card"
        name={card.title || card.text.split("\n")[0]}
        message="The card goes for good. This can't be undone. Its groups stay."
        onConfirm={async () => {
          await apply(current => removeCard(current, card.id));
          onClose();
        }}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="card-dialog-title"
      className="sw sw-rev sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[520px] rounded-[12px] p-0"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <form ref={formRef} className="px-6 pb-5 pt-5" onSubmit={submit} onKeyDown={onKeyDown} onInput={() => setError(undefined)} noValidate>
        <h2 id="card-dialog-title" className="mb-5 text-lg font-bold">{card ? "Edit card" : "New card"}</h2>

        <div className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="card-title" className="sw-label mb-1.5 block">Title</label>
            <input
              id="card-title"
              className="sw-input"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Maya misses the bus"
              autoComplete="off"
              autoFocus
              aria-invalid={error && isBlank({title, text}) ? true : undefined}
            />
          </div>

          <div>
            <label htmlFor="card-text" className="sw-label mb-1.5 block">Text</label>
            <textarea
              id="card-text"
              className="sw-input resize-y"
              rows={6}
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder="What happens, and why it matters"
            />
          </div>

          <fieldset>
            <legend className="sw-label mb-1.5 block">Groups</legend>
            {board.groups.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-x-4 gap-y-2">
                {board.groups.map(group => (
                  <label key={group.id} className="flex min-w-0 cursor-pointer items-center gap-2 text-base">
                    <input
                      type="checkbox"
                      checked={groups.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                      className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[color:var(--ui)] sw-check"
                    />
                    <span className="truncate">{group.name}</span>
                  </label>
                ))}
              </div>
            )}
            <input
              id="card-new-group"
              className="sw-input"
              value={newGroup}
              onChange={event => setNewGroup(event.target.value)}
              placeholder={board.groups.length ? "Or a new group" : "A new group, such as Act one or B plot"}
              aria-label="New group"
              autoComplete="off"
            />
          </fieldset>

          {card && board.cards.length > 1 && (
            <div>
              <label htmlFor="card-position" className="sw-label mb-1.5 block">Place in the story</label>
              <select
                id="card-position"
                className="sw-input"
                value={position}
                onChange={event => setPosition(Number(event.target.value))}
              >
                {board.cards.map((_, place) => <option key={place} value={place + 1}>Card {place + 1} of {board.cards.length}</option>)}
              </select>
            </div>
          )}
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-[color:var(--signal)]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          {card && <button type="button" className="sw-button mr-auto" onClick={() => setConfirming(true)}>Delete…</button>}
          <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="sw-button sw-button-soft" disabled={saving}>
            {card ? (saving ? "Saving…" : "Save") : (saving ? "Adding…" : "Add card")}
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default CardDialog;
