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

const ToggleGen = (color: string, text: string, current: boolean, operation: () => void) => {
    let ToggleObject = styled.div`
        background: ${color};
    `;
    if (!current)
        ToggleObject = styled.div`
            color: ${color} !important;
        `;
    return <ToggleObject className="toggle" onClick={operation}>{text}</ToggleObject>
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