import { useRef } from "react";
import { useModal } from "../../misc/modal";

type ExportDialogProps = {
  name: string,
  onPrint: () => void,
  onFountain: () => void,
  onClose: () => void,
};

// the dot menu's one Export…: the ways a script leaves Storia, each saying what
// it's for. Choosing one closes the dialog and does it
const ExportDialog = ({name, onPrint, onFountain, onClose}: ExportDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModal(dialogRef, onClose);

  const choices = [
    {id: "pdf", title: "PDF", text: "Print it, or save it as a PDF, with a title page.", run: onPrint},
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
        <h2 id="export-title" className="mb-3 break-words text-lg font-bold">Export “{name}”</h2>
        <div className="-mx-3 flex flex-col">
          {choices.map((choice, index) => (
            <button key={choice.id} type="button" className="sw-row flex flex-col items-start gap-0.5 px-3 py-2.5 text-left" onClick={choice.run} autoFocus={index === 0}>
              <span className="text-base font-bold">{choice.title}</span>
              <span className="text-sm text-[color:var(--muted)]">{choice.text}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className="sw-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </dialog>
  );
};

export default ExportDialog;
