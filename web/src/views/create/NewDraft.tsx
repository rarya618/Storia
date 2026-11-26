import { useState } from "react";
import CreatePage from "../../components/CreatePage";
import RevisionChip from "../../components/RevisionChip";
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
  onCreate: (details: {name: string, description: string}) => Promise<void>,
  onClose: () => void,
};

// New draft, from the editor's menu: the New document dialog, starting from a
// copy of this script under its name. It keeps its own error, as Edit does
const NewDraft = ({name, position, onCreate, onClose}: NewDraftProps) => {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

  const create = async (form: Record<string, string>) => {
    checkForName(form);
    await onCreate({name: form.name.trim(), description: (form.description ?? "").trim()});
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
      <p className="text-sm text-[color:var(--muted)]">
        A copy of “{name}” as it is now, as the project’s <RevisionChip position={position} className="align-middle" />. This draft stays as it is.
      </p>
    </CreatePage>
  );
};

export default NewDraft;
