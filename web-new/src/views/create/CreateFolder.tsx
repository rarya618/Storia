import { FormEvent, useState } from "react";
import FormItem from "../../datatypes/FormItem";
import { Folder } from "../../datatypes/Block";
import CreatePage, { checkForNameAndDescription, generateDate } from "../../components/CreatePage";
import { writeFolderData } from "../../firebase/database";
import { CreateFormProps } from "./CreateProject";
import { randomString } from "../../misc/randomString";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Folder name"},
  {id: "description", label: "Description", placeholder: "Folder description"}
];

const CreateFolder = (props: CreateFormProps) => {
  const [isPublic, toggleIsPublic] = useState(false);
  let uid = sessionStorage.getItem('User ID');
  let userId = uid ? uid : "";

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
      // standard data check
      checkForNameAndDescription(data);

      // add Folder to database
      let folderId = randomString(6);
      let createdOn = generateDate();

      let folder: Folder = {
        id: folderId, 
        name: data.name,
        type: 'folder',
        description: data.description, 
        isPublic: isPublic,
        createdOn: createdOn,
        owner: userId
      }
      writeFolderData(folder)
      .then(() => {
        props.toggleShow();
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
      title="Folder" 
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

export default CreateFolder;