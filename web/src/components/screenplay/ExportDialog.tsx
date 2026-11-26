import { useEffect, useRef, useState } from "react";
import { useModal } from "../../misc/modal";
import StrokeIcon from "./StrokeIcon";

type ExportDialogProps = {
  name: string,
  // makes the PDF and hands it over, unless wanted() says the writer has since closed the dialog
  onPdf: (wanted: () => boolean) => Promise<void>,
  onFountain: () => void,
  onClose: () => void,
};

const FAILED = "The PDF couldn't be made. Check your connection and try again.";

// the dot menu's one Export: the ways a script leaves Storia, each saying what
// it's for. Choosing one downloads it at once, so each row is titled and marked
// as the download it is, and the dialog needs no button but Cancel. The PDF
// takes a moment to make, so its row says so with a spinner while the others
// wait; if it fails, the row says why and takes the focus back for another try.
// Closing the dialog meanwhile drops it
const ExportDialog = ({name, onPdf, onFountain, onClose}: ExportDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pdfRef = useRef<HTMLButtonElement>(null);
  const open = useRef(true);
  const [making, setMaking] = useState(false);
  const [failed, setFailed] = useState(false);
  useModal(dialogRef, onClose);
  // set on mount as well as cleared on unmount, since development mounts twice
  useEffect(() => {
    open.current = true;
    return () => { open.current = false; };
  }, []);

  // after a failure the PDF row takes the focus back, for another try: it was
  // disabled while it worked, which let go of the focus
  useEffect(() => {
    if (failed) pdfRef.current?.focus();
  }, [failed]);

  const makePdf = async () => {
    if (making) return;
    setMaking(true);
    setFailed(false);
    try {
      await onPdf(() => open.current);
    } catch {
      if (!open.current) return;
      setFailed(true);
      setMaking(false);
    }
  };

  const choices = [
    {id: "pdf", title: "Download PDF", text: "Pages ready to print or send, with a title page.", run: makePdf},
    {id: "fountain", title: "Download Fountain", text: "A plain-text file most screenwriting apps can open.", run: onFountain},
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="export-title"
      className="sw sw-rev sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[440px] rounded-[12px] p-0"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="px-6 pb-5 pt-5">
        <h2 id="export-title" className="mb-4 break-words text-lg font-bold">Export “{name}”</h2>
        {/* each choice a hairline box on the same 24px inset as the title and Cancel */}
        <div className="flex flex-col gap-2">
          {choices.map((choice, index) => {
            const isPdf = choice.id === "pdf";
            const busy = isPdf && making;
            return (
              <button
                key={choice.id}
                ref={isPdf ? pdfRef : undefined}
                type="button"
                className={"sw-row group flex items-center gap-3 rounded-[8px] border border-[color:var(--hair)] px-4 py-3 text-left disabled:cursor-default" + (making && !busy ? " disabled:opacity-55" : "")}
                onClick={choice.run}
                disabled={making}
                aria-busy={busy || undefined}
                aria-describedby={isPdf && failed ? "export-failed" : undefined}
                autoFocus={index === 0}
              >
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <span className="text-base font-bold">{choice.title}</span>
                  {isPdf && failed
                    ? <span id="export-failed" role="alert" className="text-sm text-[color:var(--signal)]">{FAILED}</span>
                    : <span className="text-sm text-[color:var(--muted)]" aria-live={isPdf ? "polite" : undefined}>{busy ? "Making the PDF…" : choice.text}</span>}
                </span>
                {/* each row downloads at once, so it says so at its end; the PDF's spinner takes the same place */}
                {busy
                  ? <span className="sw-spinner shrink-0" style={{width: 18, height: 18}} aria-hidden="true" />
                  : <span className="shrink-0 text-[color:var(--muted)] group-hover:group-enabled:text-[color:var(--ui)]"><StrokeIcon name="download" size={20} /></span>}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </dialog>
  );
};

export default ExportDialog;
