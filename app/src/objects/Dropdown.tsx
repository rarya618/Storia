import React from "react";
import { getClassCode } from "../App";

type Props = {
    color: string,
    isDarkTheme: boolean,
    content: Item[]
};

export type Item = {
    id: string, 
    display?: string,
    onClick?: any
};

const Dropdown = (props: Props) => {
    return (
        <div
            className={
                "standard-dropdown absolute push-right " + getClassCode("", props.isDarkTheme) + " " + props.color + "-color no-select"
            }
        >
            {props.content.map(element => {
                if (element.id === "divider") {
                    return <hr className={"divider " + props.color + "-color"}/>
                }
                return <div className="item no-animation">{element.display}</div>
            })}
        </div>
    )
}

export default Dropdown;