import { Dispatch } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { standardWhiteColor } from "../styles/colors";

type Props = {
    error: string,
    display: boolean,
    toggleDisplay: Dispatch<boolean>
}

const ErrorDisplay = ({error, display, toggleDisplay}: Props) => {
    return (
        <div role="alert" aria-live="assertive" className="contents">
            {display ?
            <div className={standardWhiteColor + " z-[60] flex items-start gap-2 max-w-sm rounded-md border border-neutral-200 dark:border-neutral-700 fixed right-4 left-4 sm:left-auto top-4 std-shadow pl-4 pr-2 py-2"}>
                <p className="flex-grow py-1.5 text-sm text-neutral-800 dark:text-neutral-200">{error}</p>
                <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => toggleDisplay(false)}
                    className="h-8 w-8 shrink-0 rounded text-purple hover:bg-purple-tint-hover"
                >
                    <FontAwesomeIcon icon={faXmark}/>
                </button>
            </div> : null}
        </div>
    )
}

export default ErrorDisplay;
