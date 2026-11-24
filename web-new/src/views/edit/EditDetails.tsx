import { useState } from "react";
import CreatePage from "../../components/CreatePage";
import FormItem from "../../datatypes/FormItem";
import { Details } from "../../firebase/database";
import { checkForName } from "../../misc/forms";

const placeholders = {
  project: {name: "Working title", description: "What the story is about"},
  document: {name: "First draft", description: "What this document is for"},
};

type EditDetailsProps = {
  kind: "project" | "document",
  details: Details,
  onSave: (details: Details) => Promise<void>,
  onClose: () => void,
};

// the Edit project / Edit document dialog: the New dialog, started from what's
// there. It keeps its own error, so it works on screens without the shared one
const EditDetails = ({kind, details, onSave, onClose}: EditDetailsProps) => {
  const [errorValue, setError] = useState("");
  const [errorDisplay, setErrorDisplay] = useState(false);

  const formData: FormItem[] = [
    {id: "name", label: "Name", placeholder: placeholders[kind].name, autoComplete: "off"},
    {id: "description", label: "Description", placeholder: placeholders[kind].description, type: "textarea", optional: true},
  ];

  const save = async (data: Record<string, string>) => {
    checkForName(data);
    await onSave({name: data.name.trim(), description: (data.description ?? "").trim()});
    onClose();
  };

  return (
    <CreatePage
      title={kind === "project" ? "Project" : "Document"}
      toggleShow={onClose}
      formData={formData}
      onSubmit={save}
      initial={{name: details.name, description: details.description ?? ""}}
      errorValue={errorValue}
      setError={setError}
      errorDisplay={errorDisplay}
      setErrorDisplay={setErrorDisplay}
    />
  );
};

export default EditDetails;
