import { Dispatch } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { standardWhiteColor } from "../styles/colors";

type Props = {
    error: string,
    display: boolean,
    toggleDisplay: Dispatch<boolean>
}

const ErrorDisplay = ({error, display, toggleDisplay}: Props) => {
    
    return (
        display ? <div className={standardWhiteColor + " flex rounded-md text-purple fixed right-5 top-5 std-shadow px-3 py-2"}>
            <p className="pl-4 pr-8 py-2">{error}</p>
            <button
                onClick={() => toggleDisplay(!display)}
                className="pt-3 pl-2.5 pr-3 rounded bg-white bg-purple-tint-on-hover"
            >
                {<FontAwesomeIcon icon={faTrash}/>}
            </button>
        </div> : null
    )
}

export default ErrorDisplay;