import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode, getTypeFromFormat } from '../App';
import Button from "../objects/Button";
import { db, getDoc } from "../firebase/config";
import DocumentDropdown from "./popups/DocDropdown";
import { DocumentWithId } from "../dataTypes/Document";
import { Project, ProjectWithId } from "../dataTypes/Project";

export const Box = styled.div`
    padding: 3px 2px 7px 10px;
    margin: 5px;
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    cursor: pointer;
`;

export const BlockTop = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

export const Heading = styled.h4`
    height: 24px;
    min-width: 24px;
    font-size: 18px;
    padding: 0;
    font-weight: 700;
    margin: 4px 5px 0 0;
    text-align: left;
`;

export const Label = styled.span`
    border-radius: 2px;
    font-size: 14px;
    margin: 5px 1px;
`;

export const Text = styled.p`
    margin-right: 5px;
`;

type Props = {
    file: DocumentWithId,
    isDarkTheme: boolean
}

const RecentFile = (props: Props) => {
    var classCode = getClassCode(getTypeFromFormat(props.file.type), props.isDarkTheme);

    // dropdown toggle
    const [showDropdown, toggleDropdown] = useState(false);

    const file = props.file;

    const timeStamp = file.time ? file.time.seconds * 1000 : Date.now();
    const time = new Intl.DateTimeFormat('en-US', {year: 'numeric', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}).format(timeStamp);
    
    let projectId = file.project ? file.project : "";

    // initialise file data
    const [projectData, setData] = useState<Project>();

    async function getProjectData() {
        if (projectId !== "") {
            const docRef = db.collection('projects').doc(projectId);

            // @ts-ignore
            const tempDoc: Project = (await getDoc(docRef)).data();
            
            if (tempDoc) {
                setData(tempDoc);
            }
        }
    }

    // call function
    useEffect(() => {
        getProjectData();
    }, [projectId])
    
    return (
        <Box 
            className={'no-select white allBorders recent-block ' + classCode + '-color'}
            onClick={() => {
                document.getElementById(file.id)?.click();
            }}>
            <BlockTop>
                <Link id={file.id} className={classCode + "-color grow"} to={"/" + file.type + "/" + file.id}>
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
                <DocumentDropdown 
                    projectId={projectId}
                    showDropdown={showDropdown}
                    toggleDropdown={toggleDropdown}
                    classCode={classCode}
                    isDarkTheme={props.isDarkTheme}
                    file={props.file}
                />
            </BlockTop>
            <Text className={"heading left " + classCode + "-color"}>Last modified: {time}</Text>
            {projectId && projectData ? <Text className={"heading left " + classCode + "-color"}>In <Link className={"heading left " + classCode + "-color bold underline"} to={"/project/" + projectId}>{projectData.name}</Link></Text> : null}
        </Box>
    );
}

export default RecentFile;