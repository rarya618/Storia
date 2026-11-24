import { useRef, useState } from "react";
import {
  addProperty, Board, BoardProperty, ensureOption, orderProperties, PROPERTY_TYPES, PropertyType,
  removeOption, removeProperty, renameOption, renameProperty, sameName, STATUS_OPTIONS,
} from "../../board/board";
import { useModal } from "../../misc/modal";
import { randomString } from "../../misc/randomString";
import { toMessage } from "../../misc/errors";
import StrokeIcon from "../screenplay/StrokeIcon";
import "../../screenplay/world.css";

const TYPE_LABELS: Record<PropertyType, string> = {
  select: "Select", multi: "Multi-select", text: "Text", number: "Number", date: "Date", checkbox: "Checkbox",
};

// a name edited in place, written when the field is left
const NameField = ({value, label, onSave, className = "sw-input"}: {value: string, label: string, onSave: (name: string) => void, className?: string}) => {
  const [draft, setDraft] = useState(value);
  return (
    <input
      className={className + " min-w-0 flex-1"}
      value={draft}
      aria-label={label}
      autoComplete="off"
      onChange={event => setDraft(event.target.value)}
      onBlur={() => { if (draft.trim() && draft.trim() !== value) onSave(draft); else setDraft(value); }}
      onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); (event.target as HTMLInputElement).blur(); } }}
    />
  );
};

type PropertiesDialogProps = {
  board: Board,
  apply: (change: (board: Board) => Board) => Promise<void>,
  onClose: () => void,
};

// Properties: the board's own fields, which every card can fill in. Each change
// is written as it's made, as on a card; taking away a property or an option
// that cards use asks first, since their values go with it
const PropertiesDialog = ({board, apply, onClose}: PropertiesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModal(dialogRef, onClose);
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("select");
  const [confirming, setConfirming] = useState<string>();
  const [error, setError] = useState<string>();

  const write = (change: (board: Board) => Board) => {
    setError(undefined);
    apply(change).catch(failure => setError(toMessage(failure)));
  };
  const used = (id: string) => board.cards.filter(card => card.values?.[id] !== undefined).length;
  const taken = (candidate: string) => board.properties.some(property => sameName(property.name, candidate));

  const add = (property: BoardProperty) => {
    if (taken(property.name)) return setError("There's already a property called " + property.name.trim());
    write(current => addProperty(current, property));
    setName("");
  };
  const addStatus = () => add({
    id: randomString(12), name: "Status", type: "select",
    options: STATUS_OPTIONS.map(option => ({id: randomString(12), name: option})),
  });
  const move = (id: string, by: -1 | 1) => {
    const ids = board.properties.map(property => property.id);
    const from = ids.indexOf(id);
    const to = from + by;
    if (to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    write(current => orderProperties(current, ids));
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="properties-dialog-title"
      className="sw sw-rev sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[560px] rounded-[12px] p-0"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="max-h-[85vh] overflow-y-auto px-6 pb-5 pt-5">
        <h2 id="properties-dialog-title" className="mb-1 text-lg font-bold">Properties</h2>
        <p className="mb-5 text-sm text-[color:var(--muted)]">Fields every card on this board can fill in, such as a status, a mood or a deadline. Changes are saved as you make them.</p>

        {board.properties.length > 0 && (
          <ol className="mb-5 flex flex-col gap-3" aria-label="Properties, in order">
            {board.properties.map((property, index) => {
              const count = used(property.id);
              return (
                <li key={property.id} className="rounded-[10px] border border-[color:var(--hair)] p-3">
                  {confirming === property.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 text-sm">Remove {property.name}{count ? " and its values on " + count + (count === 1 ? " card" : " cards") : ""}? This can't be undone.</p>
                      <button type="button" className="sw-button" onClick={() => setConfirming(undefined)} autoFocus>Keep</button>
                      <button type="button" className="sw-button sw-button-soft" onClick={() => { setConfirming(undefined); write(current => removeProperty(current, property.id)); }}>Remove</button>
                    </div>
                  ) : <>
                    <div className="flex items-center gap-1.5">
                      <NameField key={property.name} value={property.name} label={"Name of " + property.name} onSave={next => write(current => renameProperty(current, property.id, next))} />
                      <span className="w-[92px] shrink-0 text-sm text-[color:var(--muted)]">{TYPE_LABELS[property.type]}</span>
                      <button type="button" className="sw-icon shrink-0" onClick={() => move(property.id, -1)} disabled={index === 0} aria-label={"Move " + property.name + " up"} title="Up">
                        <span className="rotate-180"><StrokeIcon name="chevronDown" size={16} /></span>
                      </button>
                      <button type="button" className="sw-icon shrink-0" onClick={() => move(property.id, 1)} disabled={index === board.properties.length - 1} aria-label={"Move " + property.name + " down"} title="Down">
                        <StrokeIcon name="chevronDown" size={16} />
                      </button>
                      <button type="button" className="sw-icon shrink-0" onClick={() => count ? setConfirming(property.id) : write(current => removeProperty(current, property.id))} aria-label={"Remove " + property.name} title="Remove">
                        <StrokeIcon name="close" size={16} />
                      </button>
                    </div>
                    {(property.type === "select" || property.type === "multi") && (
                      <OptionsEditor property={property} board={board} write={write} />
                    )}
                  </>}
                </li>
              );
            })}
          </ol>
        )}

        <form
          className="flex flex-wrap gap-2"
          onSubmit={event => { event.preventDefault(); if (name.trim()) add({id: randomString(12), name: name.trim(), type}); }}
        >
          <input
            className="sw-input min-w-0 flex-1 basis-40"
            value={name}
            onChange={event => { setName(event.target.value); setError(undefined); }}
            placeholder="New property"
            aria-label="New property name"
            autoComplete="off"
            autoFocus
          />
          <select className="sw-input !w-auto" value={type} onChange={event => setType(event.target.value as PropertyType)} aria-label="New property type">
            {PROPERTY_TYPES.map(option => <option key={option} value={option}>{TYPE_LABELS[option]}</option>)}
          </select>
          <button type="submit" className="sw-button shrink-0" disabled={!name.trim()}>
            <StrokeIcon name="plus" size={15} />Add
          </button>
        </form>
        {!taken("Status") && (
          <button type="button" className="sw-prop-add mt-3" onClick={addStatus}>
            <StrokeIcon name="plus" size={14} />Add Status ({STATUS_OPTIONS.join(", ")})
          </button>
        )}

        {error && <p role="alert" className="mt-3 text-sm text-[color:var(--signal)]">{error}</p>}

        <div className="mt-5 flex justify-end">
          <button type="button" className="sw-button sw-button-soft" onClick={onClose}>Done</button>
        </div>
      </div>
    </dialog>
  );
};

// a select property's options: each renamed in place or taken away, and new ones added
const OptionsEditor = ({property, board, write}: {property: BoardProperty, board: Board, write: (change: (board: Board) => Board) => void}) => {
  const [adding, setAdding] = useState("");
  const [confirming, setConfirming] = useState<string>();
  const usedBy = (optionId: string) => board.cards.filter(card => {
    const value = card.values?.[property.id];
    return Array.isArray(value) ? value.includes(optionId) : value === optionId;
  }).length;
  const add = () => {
    if (!adding.trim()) return;
    write(current => ensureOption(current, property.id, adding, randomString(12)).board);
    setAdding("");
  };

  return (
    <div className="mt-2.5 flex flex-col gap-1.5 pl-3">
      {(property.options ?? []).map(option => {
        const count = usedBy(option.id);
        return confirming === option.id ? (
          <div key={option.id} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="min-w-0 flex-1">Remove {option.name} from {count} {count === 1 ? "card" : "cards"}?</span>
            <button type="button" className="sw-button !h-8" onClick={() => setConfirming(undefined)}>Keep</button>
            <button type="button" className="sw-button sw-button-soft !h-8" onClick={() => { setConfirming(undefined); write(current => removeOption(current, property.id, option.id)); }}>Remove</button>
          </div>
        ) : (
          <div key={option.id} className="flex items-center gap-1.5">
            <NameField key={option.name} value={option.name} label={"Option " + option.name} className="sw-input !h-8 !py-1 !text-sm" onSave={next => write(current => renameOption(current, property.id, option.id, next))} />
            <span className="w-14 shrink-0 text-right text-sm tabular-nums text-[color:var(--muted)]">{count} {count === 1 ? "card" : "cards"}</span>
            <button type="button" className="sw-icon !h-8 !w-8 shrink-0" onClick={() => count ? setConfirming(option.id) : write(current => removeOption(current, property.id, option.id))} aria-label={"Remove option " + option.name} title="Remove">
              <StrokeIcon name="close" size={14} />
            </button>
          </div>
        );
      })}
      <div className="flex items-center gap-1.5">
        <input
          className="sw-input !h-8 min-w-0 flex-1 !py-1 !text-sm"
          value={adding}
          onChange={event => setAdding(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); add(); } }}
          placeholder="New option"
          aria-label={"New option for " + property.name}
          autoComplete="off"
        />
        <button type="button" className="sw-button !h-8 shrink-0" onClick={add} disabled={!adding.trim()}>Add</button>
      </div>
    </div>
  );
};

export default PropertiesDialog;
