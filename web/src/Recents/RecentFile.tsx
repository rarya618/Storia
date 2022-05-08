import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode, getTypeFromFormat } from '../App';
import Button from "../objects/Button";
import { DocumentWithId } from "./popups/NewFile";
import { DropdownGen } from "../objects/Dropdown";
import { documentDotDropdown } from "../resources/dropdowns";

export const RecentBlock = styled.div`
    padding: 7px 5px 7px 11px;
    margin: 5px;
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    cursor: pointer;
`;

export const Heading = styled.h4`
    height: 28px;
    min-width: 28px;
    font-size: 20px;
    padding: 0;
    font-weight: 400;
    margin: 6px 5px 4px 0;
    text-align: left;
`;

const Label = styled.span`
    border-radius: 5px;
    margin: 3px 1px;
`;

export const Text = styled.p`
    margin-right: 5px;
`;

type Props = {
    file: DocumentWithId,
    isDarkTheme: boolean,
}

const RecentFile = (props: Props) => {
    var classCode = getClassCode(getTypeFromFormat(props.file.type), props.isDarkTheme);

    const [showDropdown, toggleDropdown] = useState(false);

    const file = props.file;

    const timeStamp = file.time ? file.time.seconds * 1000 : Date.now();
    const time = new Intl.DateTimeFormat('en-US', {year: 'numeric', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}).format(timeStamp);
    
    return (
        <RecentBlock className={"no-select " + classCode + '-view recent-block'}>
            <div className="row">
                <Link className={classCode + "-color grow"} to={"/" + file.type + "/" + file.id}>
                    <Heading>{file.name}</Heading>
                </Link>
                <Label className={"label white-color " + classCode}>{capitalize(file.type)}</Label>
                <Button 
                    id="" 
                    text={<FontAwesomeIcon icon={dotsIcon} />} 
                    color={classCode} 
                    border="no" 
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleDropdown(!showDropdown)
                    }}
                />
                {
                    showDropdown 
                    ? DropdownGen(
                        classCode, 
                        props.isDarkTheme, 
                        documentDotDropdown()
                    ) : null
                }
            </div>
            <Text className={"heading left " + classCode + "-color-tint"}>Last modified: {time}</Text>
        </RecentBlock>
    );
}

export default RecentFile;