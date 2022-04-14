import React from "react";
import styled from "styled-components";

type Props = {
    isDarkTheme: boolean,
    mode: string,
    setMode: (e: string) => void,
    content: ToggleItem[]
};

export type ToggleItem = {
    id: string, 
    display: string,
    color: string
};

const ToggleContainer = styled.div`
    margin: 6px;
    display: flex;
    border-radius: 15px;
`;

const ToggleObject = styled.div``;

const ToggleGen = (color: string, text: string, current: boolean, operation: () => void) => {
    var className = "toggle";

    if (current) {
        className = "toggle " + color
    } else {
        className = "toggle " + color + "-color"
    }
        
    return <ToggleObject className={className} onClick={operation}>{text}</ToggleObject>
}

const Toggle = (props: Props) => {
    return (
        <ToggleContainer className="toggle-container">
            {props.content.map(element => {
                return ToggleGen(
                    element.color, 
                    element.display, 
                    props.mode === element.id, 
                    () => props.setMode(element.id)
                )
            })}
        </ToggleContainer>
    )
}

export default Toggle;