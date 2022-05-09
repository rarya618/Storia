import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode, getTypeFromFormat } from '../App';
import Button from "../objects/Button";
import { DocumentWithId } from "./popups/NewFile";
import { DropdownGen, Item } from "../objects/Dropdown";
import { divider } from "../resources/dropdowns";
import { Project } from "./popups/NewProject";
import { db, getDoc } from "../firebase/config";
import AddDocToProject from "./popups/AddDocToProject";

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

    // dropdown toggle
    const [showDropdown, toggleDropdown] = useState(false);

    // popup toggle
    const [showPopup, setShowPopup] = useState(false);

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
    }, [])

    const addToProject = {
        id: "add-to-project", 
        display: "Add to Project",
        onClick: () => {
            setShowPopup(true)
            toggleDropdown(false)
        }
    };

    const changeProject = {
        id: "change-project", 
        display: "Change Project"
    };

    // dot dropdown
    const dotDropdown: Item[] = [
        {id: "statistics", display: "Statistics"},
        {id: "doc-info", display: "Document Info"},
        divider,
        (projectId === "" ? addToProject : changeProject),
        {id: "share", display: "Share"},
        {id: "bookmark", display: "Bookmark"},
        divider,
        {id: "rename", display: "Rename"},
        {id: "delete", display: "Delete"},
    ]
    
    return (
        <RecentBlock className={"no-select " + classCode + '-view recent-block'}>
            {showPopup ? <AddDocToProject 
                    color={classCode} 
                    isDarkTheme={props.isDarkTheme}
                    closePopup={() => setShowPopup(false)}
                    file={props.file}
                    // updateFile={async () => {
                    //     await getFileData();
                    // }}
                /> : null}
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
                        dotDropdown
                    ) : null
                }
            </div>
            <Text className={"heading left " + classCode + "-color-tint"}>Last modified: {time}</Text>
            {projectId && projectData ? <Text className={"heading left " + classCode + "-color-tint"}>In <Link className={"heading left " + classCode + "-color-tint underline"} to={"/project/" + projectId}>{projectData.name}</Link></Text> : null}
        </RecentBlock>
    );
}

export default RecentFile;