import React from "react";
import styled from "styled-components";
import { getClassCode } from "../App";

type Props = {
    color: string,
    isDarkTheme: boolean,
    content: Item[],
    notAbsolute?: boolean
};

export type Item = {
    id: string, 
    display?: string | JSX.Element,
    onClick?: any
};

const DropdownObject = styled.div`
    box-shadow: 2px 5px 10px 0px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    padding: 6px 0;
    top: 36px;
    display: flex;
    flex-direction: column;
    min-width: 140px;
    margin: 0 10px;
    z-index: 1000 !important;
`;

const Item = styled.div`
    font-size: 14px;
    text-align: left;
    padding: 6px 10px;
`;

export const DropdownGen = (color: string, isDarkTheme: boolean, content: Item[], notAbsolute?: boolean) => {
    return (
        <Dropdown 
            color={color}
            isDarkTheme={isDarkTheme}
            content={content}
            notAbsolute={notAbsolute}
        />
    )
}

const Dropdown = (props: Props) => {
    return (
        <DropdownObject
            className={
                `${(props.notAbsolute ? "" : "absolute push-right")} ${getClassCode("", props.isDarkTheme)} allBorders ${props.color}-color top-layer ${props.color}-border no-select`
            }
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {props.content.map(element => {
                if (element.id === "divider") {
                    return <hr className={"divider " + props.color + "-color"}/>
                }
                if (element.onClick) {
                    return <Item className="dd-item no-animation" onClick={element.onClick}>{element.display}</Item>
                }

                return <Item className="dd-item no-animation">{element.display}</Item>
            })}
        </DropdownObject>
    )
}

export default Dropdown;