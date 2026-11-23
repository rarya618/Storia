import { useEffect, useRef, useState } from "react";

import { useTitle } from "../misc/title";
import { User } from "../datatypes/User";
import { getUser } from "../firebase/database";
import StrokeIcon from "../components/screenplay/StrokeIcon";
import "../screenplay/world.css";

// settings: a native modal <dialog> like the create dialog, holding the account's details
const SettingsView = ({toggleSettings}: {toggleSettings: () => void}) => {
  useTitle("Settings");

  const userId = sessionStorage.getItem('User ID') ?? "";
  const [user, setUser] = useState<User>();
  // undefined while loading; then whether the profile arrived
  const [loaded, setLoaded] = useState<"ok" | "failed">();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(toggleSettings);
  closeRef.current = toggleSettings;

  useEffect(() => {
    if (!userId) { setLoaded("failed"); return; }
    getUser(userId)
      .then(found => { if (found) setUser(found); setLoaded(found ? "ok" : "failed"); })
      .catch(() => setLoaded("failed"));
  }, [userId]);

  // open as a modal; Escape arrives as cancel; focus returns to the opener on close
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const onCancel = (event: Event) => { event.preventDefault(); closeRef.current(); };
    dialog.addEventListener("cancel", onCancel);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      if (dialog.open) dialog.close();
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  const rows: {label: string, value?: string}[] = [
    {label: "First name", value: user?.firstName},
    {label: "Last name", value: user?.lastName},
    {label: "Email", value: user?.email},
    {label: "Password", value: loaded && "••••••••"},
    {label: "Plan", value: user?.plan},
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-title"
      className="sw sw-rev sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[480px] rounded-[12px] p-0"
      onMouseDown={(event) => { if (event.target === event.currentTarget) toggleSettings(); }}
    >
      <div className="px-6 pb-6 pt-4">
        <div className="mb-3 flex items-center">
          <h2 id="settings-title" className="flex-1 text-lg font-bold">Settings</h2>
          <button type="button" className="sw-icon -mr-2" onClick={toggleSettings} aria-label="Close settings" title="Close" autoFocus>
            <StrokeIcon name="close" size={16} />
          </button>
        </div>

        <h3 className="sw-ruled sw-label mb-1">Account</h3>
        <dl className="divide-y divide-[color:var(--rule)]">
          {rows.map(row => (
            <div key={row.label} className="grid grid-cols-[120px_minmax(0,1fr)] items-baseline gap-3 py-2.5">
              <dt className="text-sm text-[color:var(--muted)]">{row.label}</dt>
              <dd className="break-words text-base">
                {row.value || (loaded
                  ? <span className="text-[color:var(--muted)]">{loaded === "ok" ? "Not set" : "Couldn't load"}</span>
                  : <span className="inline-block h-3.5 w-32 rounded bg-[color:var(--wash)] align-middle" aria-label="Loading" />)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  )
};

export default SettingsView;
