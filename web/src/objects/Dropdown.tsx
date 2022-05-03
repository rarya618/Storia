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

export const DropdownGen = (color: string, isDarkTheme: boolean, content: Item[]) => {
    return (
        <Dropdown 
            color={color}
            isDarkTheme={isDarkTheme}
            content={content}
        />
    )
}

const Dropdown = (props: Props) => {
    return (
        <div
            className={
                "standard-dropdown absolute push-right " + getClassCode("", props.isDarkTheme) + " " + props.color + "-color " + props.color + "-border no-select"
            }
        >
            {props.content.map(element => {
                if (element.id === "divider") {
                    return <hr className={"divider " + props.color + "-color"}/>
                }
                if (element.onClick) {
                    return <div className="item no-animation" onClick={element.onClick}>{element.display}</div>
                }

                return <div className="item no-animation">{element.display}</div>
            })}
        </div>
    )
}

export default Dropdown;