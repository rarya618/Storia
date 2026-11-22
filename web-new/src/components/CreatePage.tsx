import { Dispatch, FormEvent, useEffect, useState } from "react";
import { formStyle } from "../styles/forms";
import { Props } from "../views/create/CreateAccount";
import { PurpleButton, WhiteButton } from "./Button";
import { CheckBox } from "./CheckBox";
import ErrorDisplay from "./ErrorDisplay";
import Spacer from "./Spacer";
import TextBox from "./TextBox";
import FormItem from "../datatypes/FormItem";
import { toMessage } from "../misc/errors";

export const createContainerStyle = "bg-neutral-900 z-50 bg-opacity-30 dark:bg-opacity-60 flex fixed inset-0 overflow-y-auto px-4 py-10";

interface CreatePageProps extends Props {
  title: string,
  toggleShow: () => void,
  isPublic: boolean,
  toggleIsPublic: Dispatch<boolean>,
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

const CreatePage = (props: CreatePageProps) => {
  const [isSubmitting, setSubmitting] = useState(false);
  useEscape(props.toggleShow);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitting(true);
    try {
      await props.onSubmit(readForm(event));
    } catch (error) {
      props.setError(toMessage(error));
      props.setErrorDisplay(true);
      setSubmitting(false);
    }
  }

  const titleId = "create-" + props.title.toLowerCase() + "-title";

  return (
    <div className={createContainerStyle} onMouseDown={(event) => { if (event.target === event.currentTarget) props.toggleShow(); }}>
      <form
        className={formStyle + " shadow-xl"}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        noValidate
      >
        <ErrorDisplay error={props.errorValue} display={props.errorDisplay} toggleDisplay={props.setErrorDisplay} />
        <h2 id={titleId} className="font-light text-purple text-xl mb-4">New {props.title}</h2>
        {props.formData.map((formItem, index) => {
          return <TextBox key={formItem.id} data={formItem} autoFocus={index == 0} />
        })}
        <CheckBox id="isPublic" checked={props.isPublic} toggleChecked={props.toggleIsPublic} labelClassName="text-purple text-sm">
          Make this {props.title.toLowerCase()} public
        </CheckBox>
        <Spacer />
        <div className="flex items-center mt-4">
          <PurpleButton text={isSubmitting ? "Creating…" : "Create"} disabled={isSubmitting} />
          <span className="flex-grow"></span>
          <WhiteButton text="Cancel" onClick={props.toggleShow} />
        </div>
      </form>
    </div>
  )
}

export default CreatePage;
