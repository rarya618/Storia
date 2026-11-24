import { useRef, useState } from "react";
import { useModal } from "../misc/modal";
import { toMessage } from "../misc/errors";

type ConfirmDeleteProps = {
  noun: string,        // "project", "document"
  name: string,
  message: string,     // what goes with it, and that it can't be undone
  // a box to tick for deleting more than the default (a folder's projects), and
  // what the button says once it's ticked
  option?: {label: string, confirmLabel: string},
  onConfirm: (withOption: boolean) => Promise<void>,
  onCancel: () => void,
};

// the last step before something is deleted for good: says what goes, and waits
// for a deliberate "Delete project". Cancel is the one that takes focus, so
// Enter on arrival keeps everything
const ConfirmDelete = ({noun, name, message, option, onConfirm, onCancel}: ConfirmDeleteProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();
  const [withOption, setWithOption] = useState(false);
  useModal(dialogRef, onCancel);

  const confirm = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(undefined);
    try {
      await onConfirm(withOption);
    } catch (failure) {
      setError(toMessage(failure));
      setDeleting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-message"
      className="sw sw-rev sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[440px] rounded-[12px] p-0"
      onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}
    >
      <div className="px-6 pb-5 pt-5">
        <h2 id="confirm-delete-title" className="mb-3 break-words text-lg font-bold">Delete “{name}”?</h2>
        <p id="confirm-delete-message" className="text-base">{message}</p>
        {option && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-base">
            <input type="checkbox" checked={withOption} onChange={event => setWithOption(event.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[color:var(--ui)] sw-check" />
            <span>{option.label}</span>
          </label>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-[color:var(--signal)]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="sw-button" onClick={onCancel} autoFocus>Cancel</button>
          <button type="button" className="sw-button sw-button-soft" onClick={confirm} disabled={deleting}>
            {deleting ? "Deleting…" : withOption && option ? option.confirmLabel : "Delete " + noun}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmDelete;
