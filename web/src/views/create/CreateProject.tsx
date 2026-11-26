import { Props } from "./CreateAccount";
import FormItem from "../../datatypes/FormItem";
import { writeProjectData } from "../../firebase/database";
import CreatePage from "../../components/CreatePage";
import { checkForName, generateDate } from "../../misc/forms";
import { randomString } from "@storia/core/misc/randomString";
import { Project } from "@storia/core/datatypes/Block";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Working title", autoComplete: "off"},
  {id: "description", label: "Description", placeholder: "What the story is about", type: "textarea", optional: true}
];

export interface CreateFormProps extends Props {
  toggleShow: () => void
}

interface CreateProjectProps extends CreateFormProps {
  folderId?: string
}

const CreateProject = (props: CreateProjectProps) => {
  const userId = sessionStorage.getItem('User ID') ?? "";

  const create = async (data: Record<string, string>) => {
    // a name is required; the description is optional
    checkForName(data);

    // add Project to database
    const project: Project = {
      id: randomString(10),
      name: data.name.trim(),
      type: 'project',
      description: data.description.trim(),
      isPublic: false,
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
