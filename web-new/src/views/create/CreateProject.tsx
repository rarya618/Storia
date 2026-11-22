import { useState } from "react";
import { Props } from "./CreateAccount";
import FormItem from "../../datatypes/FormItem";
import { writeProjectData } from "../../firebase/database";
import CreatePage, { checkForNameAndDescription, generateDate } from "../../components/CreatePage";
import { randomString } from "../../misc/randomString";
import { Project } from "../../datatypes/Block";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Name of the project", autoComplete: "off"},
  {id: "description", label: "Description", placeholder: "Description of the project", type: "textarea"}
];

export interface CreateFormProps extends Props {
  toggleShow: () => void
}

interface CreateProjectProps extends CreateFormProps {
  folderId?: string
}

const CreateProject = (props: CreateProjectProps) => {
  const [isPublic, toggleIsPublic] = useState(false);
  const userId = sessionStorage.getItem('User ID') ?? "";

  const create = async (data: Record<string, string>) => {
    // standard data check
    checkForNameAndDescription(data);

    // add Project to database
    const project: Project = {
      id: randomString(10),
      name: data.name.trim(),
      type: 'project',
      description: data.description.trim(),
      isPublic: isPublic,
      createdOn: generateDate(),
      owner: userId,
      ...(props.folderId ? {folderId: props.folderId} : {})
    }

    await writeProjectData(project);
    props.setErrorDisplay(false);
    props.toggleShow();
  }

  return (
    <CreatePage
      title="Project"
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

export default CreateProject;
