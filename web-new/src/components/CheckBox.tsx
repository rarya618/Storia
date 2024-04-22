import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch } from "react";

type CheckBoxProps = {
  checked: boolean,
  toggleChecked: Dispatch<boolean>
}
  
export const CheckBox = (props: CheckBoxProps) => {
  return (
    <div 
      className="min-w-4 w-4 h-4 ml-1.5 mt-0.5 mr-3 p-0 border border-neutral-400 dark:border-neutral-600 rounded cursor-pointer overflow-hidden" 
      onClick={() => props.toggleChecked(!props.checked)}>
      { props.checked ? (
      <div className="w-4 h-4 bg-purple text-white dark:text-neutral-800 m-0">
        <FontAwesomeIcon icon={faCheck} />
      </div> 
      ) : <div className="w-4 h-4 rounded"></div> }
    </div>
  )
};