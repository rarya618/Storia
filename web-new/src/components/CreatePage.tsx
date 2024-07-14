import { Dispatch, FormEvent } from "react";
import { formContainerStyle, formStyle } from "../styles/forms";
import { Props } from "../views/create/CreateAccount";
import { PurpleButton, WhiteButton } from "./Button";
import { CheckBox } from "./CheckBox";
import ErrorDisplay from "./ErrorDisplay";
import Spacer from "./Spacer";
import TextBox from "./TextBox";
import FormItem from "../datatypes/FormItem";

const createContainerStyle = "bg-neutral-900 z-50 bg-opacity-30 dark:bg-opacity-50 flex absolute h-screen w-screen";

interface CreatePageProps extends Props {
  title: string,
  toggleShow: () => void,
  isPublic: boolean,
  toggleIsPublic: Dispatch<boolean>,
  onSubmit: (event: FormEvent) => void,
  formData: FormItem[]
}

export const checkForNameAndDescription = (data: any) => {
  if (data.name === '') throw("Please enter a name");
  if (data.description === '') throw("Please enter a description");
}

export const generateDate = () => {
  return new Date().toString();
}

const CreatePage = (props: CreatePageProps) => {
  return (
    <div className={createContainerStyle}> {/* page */}
      <div className={formContainerStyle + " my-auto relative flex"}>
        <form className={formStyle} onSubmit={props.onSubmit}>
          <ErrorDisplay error={props.errorValue} display={props.errorDisplay} toggleDisplay={props.setErrorDisplay} />
          <h2 className="font-light text-purple text-2xl mb-3">New {props.title}</h2>
          {props.formData.map(formItem => {
            return <TextBox data={formItem} />
          })}
          <div className="flex">
            <p className="text-purple flex-grow select-none">Public?</p>
            <div className="my-auto">
              <CheckBox checked={props.isPublic} toggleChecked={props.toggleIsPublic} />
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

export default CreatePage;