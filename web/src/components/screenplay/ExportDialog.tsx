import { useRef, useState } from "react";
import { useModal } from "../../misc/modal";

type ExportDialogProps = {
  name: string,
  onPdf: () => Promise<void>,
  onFountain: () => void,
  onClose: () => void,
};

// the dot menu's one Export: the ways a script leaves Storia, each saying what
// it's for. Choosing one does it; the PDF takes a moment to make, so the dialog
// stays up, saying so, until it's ready, and shows what went wrong if it fails
const ExportDialog = ({name, onPdf, onFountain, onClose}: ExportDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [making, setMaking] = useState(false);
  const [error, setError] = useState<string>();
  useModal(dialogRef, onClose);

  const makePdf = async () => {
    if (making) return;
    setMaking(true);
    setError(undefined);
    try {
      await onPdf();
    } catch {
      setError("The PDF couldn't be made. Check your connection and try again.");
      setMaking(false);
    }
  };

  const choices = [
    {id: "pdf", title: "PDF", text: making ? "Making the PDF…" : "Pages ready to print or send, with a title page.", run: makePdf},
    {id: "fountain", title: "Fountain", text: "A plain-text file most screenwriting apps can open.", run: onFountain},
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
          {choices.map((choice, index) => (
            <button key={choice.id} type="button" className="sw-row flex flex-col items-start gap-0.5 rounded-[8px] border border-[color:var(--hair)] px-4 py-3 text-left disabled:cursor-default" onClick={choice.run} disabled={making} aria-busy={choice.id === "pdf" && making} autoFocus={index === 0}>
              <span className="text-base font-bold">{choice.title}</span>
              <span className="text-sm text-[color:var(--muted)]" aria-live={choice.id === "pdf" ? "polite" : undefined}>{choice.text}</span>
            </button>
          ))}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-[color:var(--signal)]">{error}</p>}
        <div className="mt-5 flex justify-end">
          <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </dialog>
  );
};

export default ExportDialog;
