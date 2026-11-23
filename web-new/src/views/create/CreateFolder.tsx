import FormItem from "../../datatypes/FormItem";
import { Folder } from "../../datatypes/Block";
import CreatePage from "../../components/CreatePage";
import { checkForNameAndDescription, generateDate } from "../../misc/forms";
import { writeFolderData } from "../../firebase/database";
import { CreateFormProps } from "./CreateProject";
import { randomString } from "../../misc/randomString";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Spec scripts", autoComplete: "off"},
  {id: "description", label: "Description", placeholder: "What goes in this folder", type: "textarea"}
];

const CreateFolder = (props: CreateFormProps) => {
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
      isPublic: false,
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
