import React, { Dispatch, useState } from "react";
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/free-solid-svg-icons'

import { getClassCode } from "../App";
import Button from "./Button";

const ErrorBox = styled.div`
    padding: 10px;
    display: flex;
    position: fixed;
    top: 10px;
    right: 10px;
    border-radius: 5px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.25);
    -webkit-user-select: none;
    user-select: none;
    max-width: 300px;
`;

const Message = styled.p`
    margin: 0;
    padding: 8px 9px;
    text-align: left;
`;

type Props = {
    error: string,
    isDarkTheme: boolean,
    display: boolean,
    toggleDisplay: Dispatch<boolean>
}

const ErrorDisplay = ({error, isDarkTheme, display, toggleDisplay}: Props) => {
    var color = getClassCode("ideate", isDarkTheme);
    
    return (
        display ? <ErrorBox className={getClassCode("", isDarkTheme) + " " + color + "-color"}>
            <Message>{error}</Message>
            <Button
                color={color}
                onClick={() => toggleDisplay(!display)}
                border="no"
                text={<FontAwesomeIcon 
                    icon={faTrash}
                />}
            />
        </ErrorBox> : null
    )
}

export default ErrorDisplay;