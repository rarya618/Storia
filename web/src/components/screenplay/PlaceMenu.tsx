import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StrokeIcon from "./StrokeIcon";
import { useEscape } from "../../misc/forms";

export type Place = { label: string, to: string, icon?: "folder" | "pages" };

// where the script sits, as a menu off its name in the editor's bar: the name
// (the page's h1) with a chevron, opening the tree above it, from Home down
// through the folder and the project, each place a step further in, and the
// script itself at its foot, in ink and not a link. It keeps the bar to the
// script's name, however long the folder's and project's names are
const PlaceMenu = ({places, name}: {places: Place[], name: string}) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Escape closes it, the focus going back to the name if it was inside
  const close = useCallback(() => {
    if (root.current?.contains(document.activeElement)) button.current?.focus();
    setOpen(false);
  }, []);
  useEscape(close);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    // tabbing out of the menu closes it
    <div ref={root} className="relative min-w-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <h1 className="min-w-0 text-base font-bold">
        <button
          ref={button}
          type="button"
          className="flex max-w-full items-center gap-1 rounded-md px-1.5 py-1 transition-colors duration-[120ms] hover:bg-[color:var(--wash)]"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="place-menu"
          title="Where this script is"
        >
          <span className="truncate">{name}</span>
          <span className="shrink-0 text-[color:var(--muted)]"><StrokeIcon name="chevronDown" size={16} /></span>
        </button>
      </h1>
      {open && (
        <nav id="place-menu" aria-label="Where this script is" className="sw-float absolute left-0 top-11 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-[10px] py-1.5">
          <ol>
            {places.map((place, depth) => (
              <li key={place.to}>
                <Link to={place.to} className="sw-menu-item gap-2 text-[color:var(--muted)] hover:text-[color:var(--ui)]" style={{paddingLeft: 16 + depth * 16}} onClick={() => setOpen(false)}>
                  {place.icon && <span className="shrink-0"><StrokeIcon name={place.icon} size={18} /></span>}
                  <span className="truncate">{place.label}</span>
                </Link>
              </li>
            ))}
            <li aria-current="page" className="sw-menu-item gap-2 font-bold hover:!bg-transparent" style={{paddingLeft: 16 + places.length * 16}}>
              <span className="truncate">{name}</span>
            </li>
          </ol>
        </nav>
      )}
    </div>
  );
};

export default PlaceMenu;
