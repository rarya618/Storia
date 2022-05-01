import React from "react";
import styled from "styled-components";

type Props = {
    isDarkTheme: boolean,
    current: string,
    setCurrent: (e: string) => void,
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
    flex-grow: 0;
    border-radius: 15px;
`;

const ToggleObject = styled.div`
    margin: 0;
    padding: 3px 10px;
    border-radius: 15px;
    font-size: 14px;
    flex-grow: 1;
    background: transparent;
    transition-duration: 0.6s;
    transition-delay: 0.1s;
    border: none;
    z-index: 100;
`;

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
                    props.current === element.id, 
                    () => props.setCurrent(element.id)
                )
            })}
        </ToggleContainer>
    )
}

export default Toggle;