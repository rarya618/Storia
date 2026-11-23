import { FormEvent, useEffect, useRef, useState } from "react";
import { Props } from "../views/create/CreateAccount";
import FormItem from "../datatypes/FormItem";
import { toMessage } from "../misc/errors";
import "../screenplay/world.css";

// the legacy overlay, still used by the settings dialog
export const createContainerStyle = "bg-neutral-900 z-50 bg-opacity-30 dark:bg-opacity-60 flex fixed inset-0 overflow-y-auto px-4 py-10";

interface CreatePageProps extends Props {
  title: string,
  toggleShow: () => void,
  onSubmit: (data: Record<string, string>) => Promise<void>,
  formData: FormItem[]
}

// a validation failure that names the field it's about, so the dialog can focus and mark it
export class FieldError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}

export const checkForNameAndDescription = (data: Record<string, string>) => {
  if (data.name.trim() === '') throw new FieldError("name", "Please enter a name");
  if (data.description.trim() === '') throw new FieldError("description", "Please enter a description");
}

export const generateDate = () => {
  return new Date().toString();
}

// read the named fields of a submitted form into a plain object
export const readForm = (event: FormEvent) => {
  const form = event.currentTarget as HTMLFormElement;
  const data: Record<string, string> = {};
  new FormData(form).forEach((value, key) => { data[key] = String(value); });
  return data;
}

// close a modal on Escape
export const useEscape = (onEscape: () => void) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onEscape]);
}

// the New folder / project / document dialog: a native modal <dialog>, so focus stays
// inside and the page behind is inert, shown as a Float panel over a light scrim
const CreatePage = (props: CreatePageProps) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [invalidField, setInvalidField] = useState<string>();
  const {toggleShow, setErrorDisplay} = props;
  const dialogRef = useRef<HTMLDialogElement>(null);

  // a closed dialog takes its error with it
  const close = () => {
    setErrorDisplay(false);
    toggleShow();
  };
  const closeRef = useRef(close);
  closeRef.current = close;

  // open as a modal on mount; Escape arrives as the dialog's cancel event.
  // focus goes back to whatever opened the dialog when it goes away
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitting(true);
    try {
      await props.onSubmit(readForm(event));
    } catch (error) {
      props.setError(toMessage(error));
      setErrorDisplay(true);
      setSubmitting(false);
      if (error instanceof FieldError) {
        setInvalidField(error.field);
        document.getElementById("create-" + error.field)?.focus();
      }
    }
  }

  // an error stops being true once the writer starts fixing it
  const onInput = () => {
    if (props.errorDisplay) setErrorDisplay(false);
    setInvalidField(undefined);
  };

  const noun = props.title.toLowerCase();
  const titleId = "create-" + noun + "-title";
  const errorId = "create-" + noun + "-error";
  const fieldProps = (item: FormItem, index: number) => ({
    id: "create-" + item.id,
    name: item.id,
    placeholder: item.placeholder,
    autoFocus: index === 0,
    "aria-invalid": invalidField === item.id || undefined,
    "aria-describedby": invalidField === item.id && props.errorDisplay ? errorId : undefined,
  });

  return (
    // a click on the scrim lands on the dialog itself; clicks in the panel land on the form
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="sw sw-float sw-dialog m-auto w-[calc(100%-32px)] max-w-[400px] rounded-lg p-0"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <form className="px-6 pb-5 pt-5" onSubmit={submit} onInput={onInput} noValidate>
        <h2 id={titleId} className="mb-4 text-[14px] font-bold leading-[18px] tracking-tight">New {noun}</h2>

        <div className="flex flex-col gap-3.5">
          {props.formData.map((item, index) => (
            <div key={item.id}>
              <label htmlFor={"create-" + item.id} className="sw-label mb-1.5 block">{item.label}</label>
              {item.type === "textarea"
                ? <textarea {...fieldProps(item, index)} rows={4} className="sw-input resize-none" />
                : <input {...fieldProps(item, index)} type="text" autoComplete={item.autoComplete} className="sw-input" />}
            </div>
          ))}
        </div>

        {props.errorDisplay && (
          <p id={errorId} role="alert" className="mt-3 text-[12.5px] leading-[18px] text-[color:var(--signal)]">{props.errorValue}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="sw-button" onClick={close}>Cancel</button>
          <button type="submit" className="sw-button sw-button-soft" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create " + noun}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default CreatePage;
