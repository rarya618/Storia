import { useState } from "react";
import CreatePage from "../../components/CreatePage";
import { ordinal } from "../../screenplay/revisions";
import FormItem from "../../datatypes/FormItem";
import { checkForName } from "../../misc/forms";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Second draft", autoComplete: "off"},
  {id: "description", label: "Description", placeholder: "What this draft is for", type: "textarea", optional: true},
];

type NewDraftProps = {
  // the script it starts from, and the place the new draft takes in the project
  name: string,
  position: number,
  // copy: whether it starts as a copy of this script, or blank
  onCreate: (details: {name: string, description: string}, copy: boolean) => Promise<void>,
  onClose: () => void,
};

// New draft, from the editor's menu: the New document dialog, under this
// script's name, starting as a copy of it unless the writer unticks that.
// It keeps its own error, as Edit does
const NewDraft = ({name, position, onCreate, onClose}: NewDraftProps) => {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [copy, setCopy] = useState(true);

  const create = async (form: Record<string, string>) => {
    checkForName(form);
    await onCreate({name: form.name.trim(), description: (form.description ?? "").trim()}, copy);
  };

  return (
    <CreatePage
      title="Draft"
      toggleShow={onClose}
      formData={formData}
      onSubmit={create}
      defaults={{name}}
      errorValue={errorValue}
      setError={setError}
      errorDisplay={errorDisplay}
      setErrorDisplay={setErrorDisplay}
    >
      <div>
        {/* unnamed, so it stays out of the submitted form data */}
        <label className="flex cursor-pointer items-start gap-2.5 text-base">
          <input type="checkbox" checked={copy} onChange={event => setCopy(event.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[color:var(--ui)] sw-check" />
          <span>Copy from “{name}”</span>
        </label>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {copy ? "It starts as this script is now, which stays as it is" : "It starts blank"}, as the project’s {ordinal(position + 1)} draft.
        </p>
      </div>
    </CreatePage>
  );
};

export default NewDraft;
