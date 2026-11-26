import { ReactNode, useState } from "react";
import CreatePage from "../../components/CreatePage";
import FormItem from "../../datatypes/FormItem";
import { Details } from "../../firebase/database";
import { checkForName } from "../../misc/forms";

const placeholders = {
  folder: {name: "Spec scripts", description: "What goes in this folder"},
  project: {name: "Working title", description: "What the story is about"},
  document: {name: "First draft", description: "What this document is for"},
};

type EditDetailsProps = {
  kind: "folder" | "project" | "document",
  details: Details,
  // the whole form comes too, for any fields passed as children (a project's folder)
  onSave: (details: Details, form: Record<string, string>) => Promise<void>,
  onClose: () => void,
  children?: ReactNode,
};

// the Edit project / Edit document dialog: the New dialog, started from what's
// there. It keeps its own error, so it works on screens without the shared one.
// Deleting is a separate action beside it, never inside it
const EditDetails = ({kind, details, onSave, onClose, children}: EditDetailsProps) => {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

  const formData: FormItem[] = [
    {id: "name", label: "Name", placeholder: placeholders[kind].name, autoComplete: "off"},
    {id: "description", label: "Description", placeholder: placeholders[kind].description, type: "textarea", optional: true},
  ];

  const save = async (form: Record<string, string>) => {
    checkForName(form);
    await onSave({name: form.name.trim(), description: (form.description ?? "").trim()}, form);
    onClose();
  };

  return (
    <CreatePage
      title={kind === "folder" ? "Folder" : kind === "project" ? "Project" : "Document"}
      toggleShow={onClose}
      formData={formData}
      onSubmit={save}
      initial={{name: details.name, description: details.description ?? ""}}
      errorValue={errorValue}
      setError={setError}
      errorDisplay={errorDisplay}
      setErrorDisplay={setErrorDisplay}
    >
      {children}
    </CreatePage>
  );
};

export default EditDetails;
