import { KeyboardEvent, RefObject, useEffect, useRef, useState } from "react";
import { Found, ScriptEditorHandle } from "./ScriptEditor";
import { modKey } from "../../misc/keys";
import StrokeIcon from "./StrokeIcon";

type FindBarProps = {
  editor: RefObject<ScriptEditorHandle>,
  found: Found,
  // what to look for when it opens, or opens again with ⌘F (the script's
  // selected text, if any); a new seed takes the focus back to the find field
  seed: {text: string, at: number},
  // put away, with the query it held, to start from next time
  onClose: (query: string) => void,
};

// Find and replace over the script, floating at the desk's top right. The
// editor does the finding (editor/find.ts) and marks the matches on the page;
// this bar holds the two fields and says how many there are. Return steps to the
// next match and Shift+Return back; in Replace, Return replaces the selected
// match and goes to the next. Escape or the close button puts the bar away,
// returning to the script with the last match selected
const FindBar = ({editor, found, seed, onClose}: FindBarProps) => {
  const [query, setQuery] = useState(seed.text);
  const [replacement, setReplacement] = useState("");
  const findField = useRef<HTMLInputElement>(null);

  // the editor follows the query as it's typed
  useEffect(() => { editor.current?.find(query); }, [editor, query]);
  // ...and lets it go when the bar is put away
  useEffect(() => () => editor.current?.find(""), [editor]);

  useEffect(() => {
    if (seed.text) setQuery(seed.text);
    findField.current?.focus();
    findField.current?.select();
  }, [seed]);

  const close = () => {
    onClose(query);
    editor.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, onEnter: (shift: boolean) => void) => {
    if (event.key === "Escape") {
      // the screen's own Escape (popovers, rails) waits for another press
      event.stopPropagation();
      close();
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onEnter(event.shiftKey);
    }
  };

  const count = query === "" ? ""
    : found.count === 0 ? "No matches"
    : found.current >= 0 ? (found.current + 1) + " of " + found.count
    : found.count + (found.count === 1 ? " match" : " matches");
  const none = found.count === 0;

  return (
    <div role="search" aria-label="Find in script" className="sw-float absolute right-4 top-3 z-30 w-[23rem] max-w-[calc(100%-2rem)] rounded-[10px] p-2">
      <div className="flex items-center gap-1">
        <div className="relative min-w-0 flex-1">
          <input
            ref={findField}
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => onKeyDown(event, back => back ? editor.current?.findPrevious() : editor.current?.findNext())}
            placeholder="Find"
            aria-label="Find"
            aria-describedby="find-count"
            spellCheck={false}
            autoComplete="off"
            className="sw-input pr-24"
          />
          <span id="find-count" aria-live="polite" className="pointer-events-none tabular-nums absolute right-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-[color:var(--muted)]">{count}</span>
        </div>
        <button type="button" className="sw-icon" onClick={() => editor.current?.findPrevious()} disabled={none} aria-label="Previous match" title={"Previous match (Shift+" + modKey + "G)"}>
          <StrokeIcon name="chevronUp" size={18} />
        </button>
        <button type="button" className="sw-icon" onClick={() => editor.current?.findNext()} disabled={none} aria-label="Next match" title={"Next match (" + modKey + "G)"}>
          <StrokeIcon name="chevronDown" size={18} />
        </button>
        <button type="button" className="sw-icon" onClick={close} aria-label="Close find" title="Close (Esc)">
          <StrokeIcon name="close" size={18} />
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <input
          type="text"
          value={replacement}
          onChange={event => setReplacement(event.target.value)}
          onKeyDown={event => onKeyDown(event, () => editor.current?.replace(replacement))}
          placeholder="Replace with"
          aria-label="Replace with"
          spellCheck={false}
          autoComplete="off"
          className="sw-input min-w-0 flex-1"
        />
        <button type="button" className="sw-button" onClick={() => editor.current?.replace(replacement)} disabled={none}>Replace</button>
        <button type="button" className="sw-button" onClick={() => editor.current?.replaceAll(replacement)} disabled={none}>Replace all</button>
      </div>
    </div>
  );
};

export default FindBar;
