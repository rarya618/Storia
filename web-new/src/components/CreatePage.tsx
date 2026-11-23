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

export const checkForNameAndDescription = (data: Record<string, string>) => {
  if (data.name.trim() === '') throw("Please enter a name");
  if (data.description.trim() === '') throw("Please enter a description");
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

// the New folder / project / document dialog: a Float panel over a light scrim
const CreatePage = (props: CreatePageProps) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const {toggleShow, setErrorDisplay} = props;

  // a closed dialog takes its error with it
  const close = () => {
    setErrorDisplay(false);
    toggleShow();
  };
  useEscape(close);

  // focus goes back to whatever opened the dialog
  const opener = useRef<Element | null>(document.activeElement);
  useEffect(() => () => {
    if (opener.current instanceof HTMLElement) opener.current.focus();
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
    }
  }

  const noun = props.title.toLowerCase();
  const titleId = "create-" + noun + "-title";
  const errorId = "create-" + noun + "-error";

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-black/20 px-4 py-10"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <form
        // .sw sits on the panel, not the scrim: the world paints its ground white
        className="sw sw-float m-auto w-full max-w-[400px] rounded-lg px-6 pb-5 pt-5"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={props.errorDisplay ? errorId : undefined}
        noValidate
      >
        <h2 id={titleId} className="mb-4 text-[14px] font-bold leading-[18px] tracking-tight">New {noun}</h2>

        <div className="flex flex-col gap-3.5">
          {props.formData.map((item, index) => (
            <div key={item.id}>
              <label htmlFor={"create-" + item.id} className="sw-label mb-1.5 block">{item.label}</label>
              {item.type === "textarea" ? (
                <textarea id={"create-" + item.id} name={item.id} placeholder={item.placeholder} autoFocus={index === 0} rows={4} className="sw-input resize-none" />
              ) : (
                <input id={"create-" + item.id} name={item.id} type="text" placeholder={item.placeholder} autoComplete={item.autoComplete} autoFocus={index === 0} className="sw-input" />
              )}
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
    </div>
  )
}

export default CreatePage;
