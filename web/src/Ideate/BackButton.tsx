import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";

const BackButtonContainer = styled.button`
    padding: 5px 7px;
    margin-left: 4px;
    border-radius: 5px;
    display: flex;
    align-items: center;
`;

const ButtonText = styled.span`
    margin-left: 5px;
    font-size: 14px;
`;

type Props = {
    color: string,
    text: string,
}

const BackButton = ({color, text}: Props) => {
    return (
        <BackButtonContainer className={color + " white-color no-border ext-mob-hide"}>
            <FontAwesomeIcon icon={faAngleLeft} />
            <ButtonText>{text}</ButtonText>
        </BackButtonContainer>
    )
}

export default BackButton