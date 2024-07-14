import { FormEvent, useState } from "react";
import { Props } from "./CreateAccount";
import FormItem from "../../datatypes/FormItem";
import { writeProjectData } from "../../firebase/database";
import CreatePage, { checkForNameAndDescription, generateDate } from "../../components/CreatePage";
import { randomString } from "../../misc/randomString";
import { Project } from "../../datatypes/Block";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Name of the project"},
  {id: "description", label: "Description", placeholder: "Description of the project"}
];

export interface CreateFormProps extends Props {
  toggleShow: () => void
}

interface CreateProjectProps extends CreateFormProps {
  folderId?: string
}

const CreateProject = (props: CreateProjectProps) => {
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

      // add Project to database
      let projectId = randomString(10);
      let createdOn = generateDate();
      let folderId = props.folderId;

      let basicProject: Project = {
        id: projectId, 
        name: data.name,
        type: 'project',
        description: data.description, 
        isPublic: isPublic,
        createdOn: createdOn,
        owner: userId
      }

      let project: Project;
      if (folderId) {
        project = {...basicProject, folderId: folderId};
      } else {
        project = {...basicProject};
      }

      writeProjectData(project)
      .then(() => {
        props.toggleShow();
      })
      .catch(err => {
        // console.log(err);
        props.setError(err);
        props.setErrorDisplay(true);
      })
    }
    catch (error) {
      // console.log(error);
      // @ts-ignore
      props.setError(error);
      props.setErrorDisplay(true);
    }

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