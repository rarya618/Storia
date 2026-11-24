import { RefObject, useEffect, useRef } from "react";

// a native <dialog> opened as a modal on mount, so focus stays inside and the
// page behind is inert. Escape arrives as the dialog's cancel event and calls
// onClose, and focus goes back to whatever opened it when it goes away
export const useModal = (dialogRef: RefObject<HTMLDialogElement>, onClose: () => void) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

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
  }, [dialogRef]);
};
