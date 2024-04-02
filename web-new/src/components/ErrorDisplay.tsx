import { Dispatch } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/free-solid-svg-icons'

type Props = {
    error: string,
    display: boolean,
    toggleDisplay: Dispatch<boolean>
}

const ErrorDisplay = ({error, display, toggleDisplay}: Props) => {
    
    return (
        display ? <div className="">
            <p>{error}</p>
            <button
                onClick={() => toggleDisplay(!display)}
            >
                {<FontAwesomeIcon icon={faTrash}/>}
            </button>
        </div> : null
    )
}

export default ErrorDisplay;