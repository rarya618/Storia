import { useState } from "react";
import { Board, BoardCard, BoardProperty, ensureOption, PropertyValue, setValue } from "@storia/core/board/board";
import { randomString } from "@storia/core/misc/randomString";
import StrokeIcon from "../screenplay/StrokeIcon";
import { PropRow } from "./CardDocument";

type Write = (change: (board: Board) => Board) => void;

// a new option's name, typed in place; Enter adds it, Escape or an empty blur gives up
const NewOption = ({onAdd, onCancel}: {onAdd: (name: string) => void, onCancel: () => void}) => {
  const [name, setName] = useState("");
  return (
    <input
      className="sw-input !h-8 !w-40 !py-1 !text-sm"
      value={name}
      autoFocus
      placeholder="Option name"
      aria-label="New option"
      onChange={event => setName(event.target.value)}
      onBlur={() => name.trim() ? onAdd(name) : onCancel()}
      onKeyDown={event => {
        if (event.key === "Enter") { event.preventDefault(); if (name.trim()) onAdd(name); }
        if (event.key === "Escape") { event.stopPropagation(); onCancel(); }
      }}
    />
  );
};

// some text or a number, written when the field is left or Enter is pressed
const TypedValue = ({property, value, onSave, fieldId}: {property: BoardProperty, value?: PropertyValue, onSave: (value: unknown) => void, fieldId: string}) => {
  const shown = value === undefined ? "" : String(value);
  const [draft, setDraft] = useState(shown);
  const [editing, setEditing] = useState(false);
  const save = () => {
    setEditing(false);
    if (draft === shown) return;
    onSave(property.type === "number" ? (draft.trim() === "" ? undefined : Number(draft)) : draft);
  };
  return (
    <input
      id={fieldId}
      type={property.type === "number" ? "number" : "text"}
      className="sw-prop-input"
      value={editing ? draft : shown}
      placeholder="Empty"
      onFocus={() => { setDraft(shown); setEditing(true); }}
      onChange={event => setDraft(event.target.value)}
      onBlur={save}
      onKeyDown={event => {
        if (event.key === "Enter") { event.preventDefault(); (event.target as HTMLInputElement).blur(); }
        if (event.key === "Escape") { event.stopPropagation(); setDraft(shown); setEditing(false); (event.target as HTMLInputElement).blur(); }
      }}
    />
  );
};

const NEW = "__new";

// one property's value on a card, edited in the way its type asks for
const PropertyValueField = ({card, property, write}: {card: BoardCard, property: BoardProperty, write: Write}) => {
  const [adding, setAdding] = useState(false);
  const value = card.values?.[property.id];
  const fieldId = "card-prop-" + card.id + "-" + property.id;
  const save = (next: unknown) => write(board => setValue(board, card.id, property.id, next));
  // a new option, made and chosen at once
  const addOption = (name: string) => {
    const id = randomString(12);
    setAdding(false);
    write(board => {
      const added = ensureOption(board, property.id, name, id);
      if (!added.id) return board;
      const current = added.board.cards.find(other => other.id === card.id)?.values?.[property.id];
      const next = property.type === "multi" ? [...new Set([...(Array.isArray(current) ? current : []), added.id])] : added.id;
      return setValue(added.board, card.id, property.id, next);
    });
  };
  const options = property.options ?? [];

  switch (property.type) {
    case "select":
      return adding ? <NewOption onAdd={addOption} onCancel={() => setAdding(false)} /> : (
        <select
          id={fieldId}
          className={"sw-prop-select" + (value === undefined ? " sw-prop-pick" : "")}
          value={typeof value === "string" ? value : ""}
          onChange={event => event.target.value === NEW ? setAdding(true) : save(event.target.value || undefined)}
        >
          <option value="">Empty</option>
          {options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
          <option value={NEW}>New option…</option>
        </select>
      );
    case "multi": {
      const chosen = new Set(Array.isArray(value) ? value : []);
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          {options.map(option => (
            <button
              key={option.id}
              type="button"
              className="sw-filter sw-filter-small"
              aria-pressed={chosen.has(option.id)}
              onClick={() => save(chosen.has(option.id) ? [...chosen].filter(id => id !== option.id) : [...chosen, option.id])}
            >
              <span className="truncate">{option.name}</span>
            </button>
          ))}
          {adding ? <NewOption onAdd={addOption} onCancel={() => setAdding(false)} /> : (
            <button type="button" className="sw-prop-add" onClick={() => setAdding(true)}>
              <StrokeIcon name="plus" size={14} />{options.length ? "New" : "Add an option"}
            </button>
          )}
        </div>
      );
    }
    case "checkbox":
      return (
        <input
          id={fieldId}
          type="checkbox"
          className="h-[18px] w-[18px] cursor-pointer accent-[color:var(--ui)] sw-check"
          checked={value === true}
          onChange={event => save(event.target.checked)}
        />
      );
    case "date":
      return (
        <span className="flex items-center gap-1">
          <input id={fieldId} type="date" className="sw-prop-input !w-auto" value={typeof value === "string" ? value : ""} onChange={event => save(event.target.value || undefined)} />
          {value !== undefined && (
            <button type="button" className="sw-chip-remove" onClick={() => save(undefined)} aria-label={"Clear " + property.name} title="Clear">
              <StrokeIcon name="close" size={12} />
            </button>
          )}
        </span>
      );
    default:
      return <TypedValue key={String(value)} property={property} value={value} onSave={save} fieldId={fieldId} />;
  }
};

// the board's own properties as rows on a card's page, then a way to add one
const PropertyRows = ({board, card, write, onManage}: {board: Board, card: BoardCard, write: Write, onManage: () => void}) => <>
  {board.properties.map(property => (
    <PropRow
      key={property.id}
      label={property.name}
      htmlFor={property.type === "multi" ? undefined : "card-prop-" + card.id + "-" + property.id}
    >
      <PropertyValueField card={card} property={property} write={write} />
    </PropRow>
  ))}
  <div className="sw-prop">
    <button type="button" className="sw-prop-add -ml-2 w-fit" onClick={onManage}>
      <StrokeIcon name="plus" size={14} />{board.properties.length ? "Properties" : "Add a property"}
    </button>
  </div>
</>;

export default PropertyRows;
