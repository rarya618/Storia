import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePage, { checkForNameAndDescription, generateDate } from "../../components/CreatePage";
import FormItem from "../../datatypes/FormItem";
import Document from "../../datatypes/Document";
import { CreateFormProps } from "./CreateProject";
import { writeDocumentData } from "../../firebase/database";
import { randomString } from "../../misc/randomString";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "First draft", autoComplete: "off"},
  {id: "description", label: "Description", placeholder: "What this document is for", type: "textarea"}
];

interface CreateDocumentProps extends CreateFormProps {
  projectId: string
}

const CreateDocument = (props: CreateDocumentProps) => {
  const [isPublic, toggleIsPublic] = useState(false);
  const userId = sessionStorage.getItem('User ID') ?? "";
  const navigate = useNavigate();

  const create = async (data: Record<string, string>) => {
    checkForNameAndDescription(data);

    // add Document to database, starting with an empty scene heading
    const doc: Document = {
      id: randomString(10),
      name: data.name.trim(),
      description: data.description.trim(),
      isPublic: isPublic,
      projectId: props.projectId,
      owner: userId,
      createdOn: generateDate(),
      content: [{id: randomString(8), type: "heading", text: ""}]
    }
    await writeDocumentData(doc, props.projectId);
    props.setErrorDisplay(false);
    navigate('/document/' + doc.id);
  }

  return (
    <CreatePage
      title="Document"
      isPublic={isPublic}
      toggleIsPublic={toggleIsPublic}
      toggleShow={props.toggleShow}
      formData={formData}
      onSubmit={create}
      errorValue={props.errorValue}
      setError={props.setError}
      errorDisplay={props.errorDisplay}
      setErrorDisplay={props.setErrorDisplay}
    />
  )
}

export default CreateDocument;
