import { useState } from "react";
import CreatePage, { checkForNameAndDescription } from "../../components/CreatePage";
import FormItem from "../../datatypes/FormItem";
import Document from "../../datatypes/Document";
import { CreateFormProps } from "./CreateProject";
import { writeDocumentData } from "../../firebase/database";
import { useParams } from "react-router-dom";
import { randomString } from "../../misc/randomString";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Name of the document"},
  {id: "description", label: "Description", placeholder: "Description of the document", type: "textarea"}
];

const CreateDocument = (props: CreateFormProps) => {
  const [isPublic, toggleIsPublic] = useState(false);
  let uid = sessionStorage.getItem('User ID');
  let userId = uid ? uid : "";
  let { id } = useParams<string>();
  let projectId = id ? id : undefined

  const create = async (data: Record<string, string>) => {
    checkForNameAndDescription(data);

    // add Document to database
    const documentId = randomString(10);
    const doc: Document = {
      id: documentId,
      name: data.name.trim(),
      description: data.description.trim(),
      isPublic: isPublic,
      projectId: projectId,
      owner: userId
    }
    await writeDocumentData(doc, projectId);
    window.location.href = '/document/' + documentId;
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