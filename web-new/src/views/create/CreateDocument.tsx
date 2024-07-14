import { FormEvent, useState } from "react";
import CreatePage from "../../components/CreatePage";
import FormItem from "../../datatypes/FormItem";
import Document from "../../datatypes/Document";
import { CreateFormProps } from "./CreateProject";
import { writeDocumentData } from "../../firebase/database";
import { useParams } from "react-router-dom";
import { randomString } from "../../misc/randomString";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Name of the document"},
  {id: "description", label: "Description", placeholder: "Description of the document"}
];

const CreateDocument = (props: CreateFormProps) => {
  const [isPublic, toggleIsPublic] = useState(false);
  let uid = sessionStorage.getItem('User ID');
  let userId = uid ? uid : "";
  let { id } = useParams<string>();
  let projectId = id ? id : undefined

  const create = (event: FormEvent) => {
    event.preventDefault();

    // @ts-ignore
    const elementsArray = [...event.target.elements];

    const data = elementsArray.reduce((acc, element) => {
      if (element.id) {
        acc[element.id] = element.value;
      }

      return acc;
    }, {});

    try {
      if (data.name === '') throw("Please enter a name");
      if (data.description === '') throw("Please enter a description");

      // add Document to database
      let documentId = randomString(10);
      let doc: Document = {
        id: documentId, 
        name: data.name,
        description: data.description, 
        isPublic: isPublic,
        projectId: projectId,
        owner: userId
      }
      writeDocumentData(doc, projectId)
      .then(() => {
        window.location.href = '/document/' + documentId;
      })
      .catch(err => {
        props.setError(err);
        props.setErrorDisplay(true);
      })
    }
    catch (error) {
      // @ts-ignore
      props.setError(error);
      props.setErrorDisplay(true);
    }

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