import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode, getTypeFromFormat } from '../App';
import Button from "../objects/Button";

const FileContainer = styled.div`
    padding: 7px 5px 7px 12px;
    margin: 8px;
    min-width: 300px;
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    cursor: pointer;
`;

const Heading = styled.h4`
    height: 28px;
    min-width: 28px;
    font-size: 20px;
    padding: 0;
    font-weight: 400;
    margin: 5px 25px 5px 0;
    text-align: left;
`;

const Label = styled.span`
    border-radius: 5px;
    margin: 3px 1px;
`;

type Props = {
    name: string,
    isDarkTheme: boolean,
    type: string,
    id: string
}

const RecentFile = (props: Props) => {
    var classCode = getClassCode(getTypeFromFormat(props.type), props.isDarkTheme);
    
    return (
            <FileContainer 
                className={"no-select white " + classCode + "-color"}
                onClick={() => {
                    window.location.href = "./" + props.type + "/" + props.id
                }}>
                <div className="row">
                    <Heading className={classCode + "-color grow"}>{props.name}</Heading>
                        <Label className={"label white-color " + classCode}>{capitalize(props.type)}</Label>
                    <Button 
                        id="" 
                        text={<FontAwesomeIcon icon={dotsIcon} />} 
                        color={classCode} 
                        border="no" 
                        onClick={(e) => {e.stopPropagation()}}
                    />
                </div>
                <p className={"heading left " + classCode + "-color"}>Last opened at 18:03, 21 April</p>
            </FileContainer>
    );
}

export default RecentFile;