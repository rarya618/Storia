import React, { MouseEventHandler } from "react";
import styled from "styled-components";

type Props = {
    onClick?: MouseEventHandler,
    text: string | JSX.Element,
    color: string,
    border?: string,
    id?: string,
    className?: string
}

const ButtonContainer = styled.button`
    padding: 1px 6px;
    // padding: 0px 6px;
    // height: 26px;
    height: 27px;
    min-width: 20px;
    font-size: 14px;
    border: solid 1px;
`;

const Button = ({color, onClick, text, border, id, className}: Props) => {
    return (
        <ButtonContainer 
            className={color + "-color no-animation " 
            + color + "-button " 
            + border + "-border round-5px small-spaced-small no-select" + (className ? " " + className : "")} 
            onClick={onClick} 
            id={id}>
            {text}
        </ButtonContainer>
    )
}

export default Button;