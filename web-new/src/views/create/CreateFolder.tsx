import { useState } from "react";
import FormItem from "../../datatypes/FormItem";
import { Folder } from "../../datatypes/Block";
import CreatePage, { checkForNameAndDescription, generateDate } from "../../components/CreatePage";
import { writeFolderData } from "../../firebase/database";
import { CreateFormProps } from "./CreateProject";
import { randomString } from "../../misc/randomString";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Name of the folder", autoComplete: "off"},
  {id: "description", label: "Description", placeholder: "Description of the folder", type: "textarea"}
];

const CreateFolder = (props: CreateFormProps) => {
  const [isPublic, toggleIsPublic] = useState(false);
  const userId = sessionStorage.getItem('User ID') ?? "";

  const create = async (data: Record<string, string>) => {
    // standard data check
    checkForNameAndDescription(data);

    // add Folder to database
    const folder: Folder = {
      id: randomString(6),
      name: data.name.trim(),
      type: 'folder',
      description: data.description.trim(),
      isPublic: isPublic,
      createdOn: generateDate(),
      owner: userId
    }

    await writeFolderData(folder);
    props.setErrorDisplay(false);
    props.toggleShow();
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
