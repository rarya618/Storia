import React, { Dispatch } from "react";

// @ts-ignore
import { allElements } from "../views/WriterView";

type Props = {color: string, border: string, currentElementType: string, setElementType: Dispatch<string>};

type ElementObject = {code: string, display: string};

const ElementsDropdown = (props: Props) => {
    return (
        <select
            className={
                "button relative-button remove-webkit dropdown small " +
                props.color + "-color " + 
                props.color + "-view " + 
                props.border + "-border round-5px small-spaced no-select"
            }
            value={props.currentElementType}
        >
            {allElements.map((element: ElementObject, index: number) => {
                return <option key={index} value={element.code}>{element.display}</option>
            })}
        </select>
    )
}

export default ElementsDropdown;