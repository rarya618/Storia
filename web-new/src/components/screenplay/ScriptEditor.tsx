import { forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ELEMENTS, ElementType, ScriptBlock, elementLabel } from "../../screenplay/types";
import {
  looksLikeHeading, textForType, typeAfterEnter, typeAfterTab,
  typeBefore, typeOnEmptyBackspace, typeOnEmptyEnter
} from "../../screenplay/flow";
import { characterNames, characterSuggestions } from "../../screenplay/characters";
import { randomString } from "../../misc/randomString";

export type ScriptEditorHandle = {
  focusBlock: (id: string, caret?: Caret) => void,
};

type Caret = "start" | "end" | number;

type ScriptEditorProps = {
  blocks: ScriptBlock[],
  setBlocks: (update: (blocks: ScriptBlock[]) => ScriptBlock[]) => void,
  activeId?: string,
  setActiveId: (id: string) => void,
};

const newBlock = (type: ElementType, text = ""): ScriptBlock => ({id: randomString(8), type, text});

const isModifier = (event: KeyboardEvent) => event.metaKey || event.ctrlKey;

// grow a textarea to fit its text
const autosize = (element: HTMLTextAreaElement | null) => {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
};

const ScriptEditor = forwardRef<ScriptEditorHandle, ScriptEditorProps>(({blocks, setBlocks, activeId, setActiveId}, ref) => {
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  const [focusRequest, setFocusRequest] = useState<{id: string, caret: Caret}>();

  // character autocomplete
  const names = useMemo(() => characterNames(blocks), [blocks]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [dismissedFor, setDismissedFor] = useState<string>();

  const activeBlock = blocks.find(block => block.id === activeId);
  const suggestions = activeBlock?.type === "character" && dismissedFor !== activeBlock.text
    ? characterSuggestions(names, activeBlock.text)
    : [];

  useImperativeHandle(ref, () => ({
    focusBlock: (id, caret = "end") => setFocusRequest({id, caret}),
  }));

  // move focus and caret after the blocks have re-rendered
  useLayoutEffect(() => {
    if (!focusRequest) return;
    const field = fields.current.get(focusRequest.id);
    if (!field) return;

    const position = focusRequest.caret === "start" ? 0
      : focusRequest.caret === "end" ? field.value.length
      : focusRequest.caret;

    field.focus();
    field.setSelectionRange(position, position);
    field.closest(".sp-block")?.scrollIntoView({block: "nearest"});
    setFocusRequest(undefined);
  }, [focusRequest, blocks]);

  // fit every block to its text, including after the page rescales
  useLayoutEffect(() => {
    fields.current.forEach(autosize);
  }, [blocks]);

  useEffect(() => {
    const onResize = () => fields.current.forEach(autosize);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const updateBlock = (id: string, changes: Partial<ScriptBlock>) =>
    setBlocks(current => current.map(block => block.id === id ? {...block, ...changes} : block));

  const changeType = (block: ScriptBlock, type: ElementType) =>
    updateBlock(block.id, {type, text: textForType(block.text, block.type, type)});

  const onTextChange = (block: ScriptBlock, text: string) => {
    setSuggestionIndex(0);

    if (block.type === "action" && looksLikeHeading(text)) {
      return updateBlock(block.id, {type: "heading", text});
    }
    if (block.type === "dialogue" && text === "(") {
      updateBlock(block.id, {type: "parenthetical", text: "()"});
      return setFocusRequest({id: block.id, caret: 1});
    }
    updateBlock(block.id, {text});
  };

  const acceptSuggestion = (block: ScriptBlock, name: string) => {
    updateBlock(block.id, {text: name});
    setDismissedFor(name);
    setFocusRequest({id: block.id, caret: "end"});
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, block: ScriptBlock, index: number) => {
    const field = event.currentTarget;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const text = block.text;

    // autocomplete list takes arrow keys, Enter and Tab while it's open
    if (suggestions.length > 0 && block.id === activeId) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        return setSuggestionIndex((suggestionIndex + step + suggestions.length) % suggestions.length);
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        return acceptSuggestion(block, suggestions[suggestionIndex]);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        return setDismissedFor(text);
      }
    }

    // Cmd/Ctrl + 1–6 sets the element type
    if (isModifier(event) && !event.altKey) {
      const element = ELEMENTS.find(element => element.shortcut === event.key);
      if (element) {
        event.preventDefault();
        return changeType(block, element.type);
      }
    }

    if (event.key === "Tab") {
      event.preventDefault();
      return changeType(block, event.shiftKey ? typeBefore(block.type) : typeAfterTab(block.type));
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (text.trim() === "") return changeType(block, typeOnEmptyEnter(block.type));

      let before = text.slice(0, start);
      let after = text.slice(end);

      // Enter just inside a parenthetical's closing bracket finishes it
      if (block.type === "parenthetical" && after === ")") {
        before += ")";
        after = "";
      }

      const next = newBlock(typeAfterEnter(block.type), after);
      setBlocks(current => {
        const updated = current.map(other => other.id === block.id ? {...other, text: before} : other);
        updated.splice(index + 1, 0, next);
        return updated;
      });
      return setFocusRequest({id: next.id, caret: "start"});
    }

    if (event.key === "Backspace" && start === 0 && end === 0) {
      if (text === "") {
        const fallback = typeOnEmptyBackspace(block.type);
        if (fallback) {
          event.preventDefault();
          return changeType(block, fallback);
        }
        if (blocks.length === 1) return;

        // delete the empty block
        event.preventDefault();
        const target = index > 0 ? blocks[index - 1] : blocks[index + 1];
        setBlocks(current => current.filter(other => other.id !== block.id));
        return setFocusRequest({id: target.id, caret: index > 0 ? "end" : "start"});
      }

      // merge into the previous block
      if (index > 0) {
        event.preventDefault();
        const previous = blocks[index - 1];
        setBlocks(current => current
          .filter(other => other.id !== block.id)
          .map(other => other.id === previous.id ? {...other, text: other.text + text} : other));
        return setFocusRequest({id: previous.id, caret: previous.text.length});
      }
    }

    // arrow keys move between blocks at their edges
    if (event.key === "ArrowUp" && start === 0 && end === 0 && index > 0) {
      event.preventDefault();
      return setFocusRequest({id: blocks[index - 1].id, caret: "end"});
    }
    if (event.key === "ArrowDown" && start === text.length && end === text.length && index < blocks.length - 1) {
      event.preventDefault();
      return setFocusRequest({id: blocks[index + 1].id, caret: "start"});
    }
  };

  return (
    <div role="group" aria-label="Screenplay">
      {blocks.map((block, index) => {
        const isActive = block.id === activeId;
        const showSuggestions = isActive && suggestions.length > 0;
        const listId = "suggestions-" + block.id;

        return (
          <div key={block.id} className={"sp-block sp-" + block.type}>
            {isActive && (
              <span className="sp-gutter-label hidden sm:block text-purple/80 select-none" aria-hidden="true">
                {elementLabel(block.type)}
              </span>
            )}
            <textarea
              ref={element => {
                if (element) fields.current.set(block.id, element);
                else fields.current.delete(block.id);
              }}
              rows={1}
              value={block.text}
              className="sp-field"
              aria-label={elementLabel(block.type)}
              placeholder={isActive ? elementLabel(block.type) : undefined}
              spellCheck={block.type === "action" || block.type === "dialogue"}
              onFocus={() => setActiveId(block.id)}
              onChange={event => onTextChange(block, event.target.value)}
              onKeyDown={event => onKeyDown(event, block, index)}
              role={block.type === "character" ? "combobox" : undefined}
              aria-autocomplete={block.type === "character" ? "list" : undefined}
              aria-expanded={block.type === "character" ? showSuggestions : undefined}
              aria-controls={showSuggestions ? listId : undefined}
              aria-activedescendant={showSuggestions ? listId + "-" + suggestionIndex : undefined}
            />
            {showSuggestions && (
              <ul
                id={listId}
                role="listbox"
                aria-label="Characters"
                className="absolute left-0 top-full z-20 mt-1 min-w-[18ch] rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
              >
                {suggestions.map((name, suggestion) => (
                  <li
                    key={name}
                    id={listId + "-" + suggestion}
                    role="option"
                    aria-selected={suggestion === suggestionIndex}
                    onMouseDown={event => { event.preventDefault(); acceptSuggestion(block, name); }}
                    className={"cursor-pointer px-3 py-1 uppercase " + (suggestion === suggestionIndex ? "bg-purple-tint-hover text-purple" : "text-neutral-800 dark:text-neutral-200")}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default ScriptEditor;
