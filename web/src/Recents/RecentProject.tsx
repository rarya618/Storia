import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode, getTypeFromFormat } from '../App';
import Button from "../objects/Button";
import { WSProjectWithId } from "./NewProject";

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
    file: WSProjectWithId,
    classCode: string
}

const RecentProject = (props: Props) => {
    var classCode = props.classCode;

    const file = props.file;

    const timeStamp = file.time ? file.time.seconds * 1000 : Date.now();
    const time = new Intl.DateTimeFormat('en-US', {year: 'numeric', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}).format(timeStamp);
    
    return (
        <FileContainer className={"no-select white " + classCode + "-color"}>
            <div className="row">
                <Link className={classCode + "-color grow"} to={"/project/" + file.id}>
                    <Heading>{file.name}</Heading>
                </Link>
                <Button 
                    id="" 
                    text={<FontAwesomeIcon icon={dotsIcon} />} 
                    color={classCode} 
                    border="no" 
                    onClick={(e) => {e.stopPropagation()}}
                />
            </div>
            <p className={"heading left " + classCode + "-color"}>Last opened: {time}</p>
        </FileContainer>
    );
}

export default RecentProject;