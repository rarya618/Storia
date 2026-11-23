import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getUser } from "../firebase/database";
import { rememberUser, seenUser } from "../misc/seen";
import StrokeIcon from "./screenplay/StrokeIcon";

// the foot of the rail: who is signed in, opening upward onto settings, log
// out, and the plan
const AccountMenu = ({onSettings}: {onSettings: () => void}) => {
  const userId = sessionStorage.getItem("User ID") ?? "";
  const [user, setUser] = useState(seenUser);
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!userId) return;
    getUser(userId).then(found => {
      if (!found) return;
      rememberUser(found);
      setUser(found);
    }).catch(() => {});
  }, [userId]);

  // closes on an outside click; Escape hands focus back to the button
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const name = user ? user.firstName + " " + user.lastName : "Account";

  return (
    // tabbing out of the menu closes it
    <div
      ref={menuRef}
      className="relative shrink-0 border-t border-[color:var(--hair)] p-2"
      onBlur={event => { if (isOpen && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}
    >
      {isOpen && (
        <div id="account-menu" className="sw-float absolute inset-x-2 bottom-full z-50 mb-1 rounded-[10px] py-1.5">
          <div className="py-1">
            <button type="button" className="sw-menu-item" onClick={() => { setOpen(false); onSettings(); }}>Settings</button>
            <Link to="/account/logout" className="sw-menu-item" onClick={() => setOpen(false)}>Log out</Link>
          </div>
          <div className="border-t border-[color:var(--rule)] px-4 pb-1 pt-2.5 text-sm text-[color:var(--muted)]">
            <p>Beta plan, lifetime availability</p>
            <p className="tabular-nums">Version 1.0.0</p>
          </div>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="sw-row flex w-full items-center gap-2 !px-2 text-left"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label={"Account: " + name}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{name}</span>
          {user?.email && <span className="block truncate text-sm text-[color:var(--muted)]">{user.email}</span>}
        </span>
        <span className="shrink-0 text-[color:var(--muted)]" aria-hidden="true"><StrokeIcon name="dots" size={18} /></span>
      </button>
    </div>
  );
};

export default AccountMenu;
