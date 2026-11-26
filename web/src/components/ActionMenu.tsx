import { Fragment, useEffect, useId, useRef, useState } from "react";
import StrokeIcon from "./screenplay/StrokeIcon";

// apart: set off from the actions before it by a rule (Delete, last)
export type MenuAction = {label: string, onSelect: () => void, apart?: boolean};

type ActionMenuProps = {
  // the button's name for a screen reader: "More for Paper Boats"
  label: string,
  actions: MenuAction[],
  // where the button sits, and where the menu opens from it
  className?: string,
  buttonClassName?: string,
  iconSize?: number,
  menuClassName?: string,
};

// a dot button that opens a Float menu of a thing's actions: Edit details,
// then Delete apart. It closes on a choice, an outside click, Escape or
// tabbing out; a choice hands focus back to the button first, so a dialog it
// opens returns focus there when it closes
const ActionMenu = ({label, actions, className = "relative", buttonClassName = "sw-icon", iconSize, menuClassName = "right-0 top-11 w-60"}: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const choose = (action: MenuAction) => {
    setOpen(false);
    buttonRef.current?.focus();
    action.onSelect();
  };

  return (
    <div
      ref={wrapRef}
      className={className}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}
      onKeyDown={event => {
        if (event.key !== "Escape" || !open) return;
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }}
    >
      <button ref={buttonRef} type="button" className={buttonClassName} onClick={() => setOpen(!open)} aria-label={label} title="More" aria-expanded={open} aria-controls={id}>
        <StrokeIcon name="dots" size={iconSize} />
      </button>
      {open && (
        <div id={id} className={"sw-float absolute z-50 rounded-[10px] py-1.5 " + menuClassName}>
          {actions.map(action => (
            <Fragment key={action.label}>
              {action.apart && <div role="separator" className="my-1.5 border-t border-[color:var(--rule)]" />}
              <button type="button" className="sw-menu-item" onClick={() => choose(action)}>{action.label}</button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
