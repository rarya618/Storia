import { FormEvent, useState } from "react";
import { formContainerStyle, formStyle } from "../styles/forms";
import { CheckBox } from "../components/CheckBox";
import { CreateProps } from "./CreateAccount";
import FormItem from "../datatypes/FormItem";
import InputTextBox from "../components/TextBox";
import Spacer from "../components/Spacer";
import { PurpleButton, WhiteButton } from "../components/Button";
import ErrorDisplay from "../components/ErrorDisplay";
import { writeProjectData } from "../firebase/database";
import { randomString } from "../App";
import { Project } from "../datatypes/Project";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "Name of the project"},
  {id: "description", label: "Description", placeholder: "Description of the project"}
];

interface ProjectCreateProps extends CreateProps {
  toggleShow: () => void
}

const CreateProject = (props: ProjectCreateProps) => {
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
      if (data.name === '') throw("Please enter a name");
      if (data.description === '') throw("Please enter a description");

      // add Project to database
      let projectId = randomString(10);
      let project: Project = {
        id: projectId, 
        name: data.name,
        description: data.description, 
        isPublic: isPublic,
        owner: userId
      }
      writeProjectData(project)
      .then(() => {
        window.location.href = '/project/' + projectId;
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
    <div className="bg-neutral-900 bg-opacity-30 dark:bg-opacity-60 flex absolute h-screen w-screen"> {/* page */}
      <div className={formContainerStyle + " my-auto relative flex"}>
        <form className={formStyle} onSubmit={create}>
          <ErrorDisplay error={props.errorValue} display={props.errorDisplay} toggleDisplay={props.setErrorDisplay} />
          <h2 className="font-light text-purple text-2xl mb-3">New Project</h2>
          {formData.map(formItem => {
            return InputTextBox(formItem)
          })}
          <div className="flex">
            <p className="text-purple flex-grow select-none">Public?</p>
            <div className="my-auto">
              <CheckBox checked={isPublic} toggleChecked={toggleIsPublic} />
            </div>
          </div>
          <Spacer />
          <div className="flex">
            <PurpleButton text="Create" />
            <span className="flex-grow"></span>
            <WhiteButton text="Not now" onClick={props.toggleShow} />
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProject;