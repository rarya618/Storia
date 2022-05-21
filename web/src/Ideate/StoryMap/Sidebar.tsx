import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon, faPlus } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode } from "../../App";
import Button from "../../objects/Button";
import Select, { ItemType } from "../../objects/Select";
import { collection } from "firebase/firestore";
import { db, getDocs, query, where} from "../../firebase/config";
import { Link } from "react-router-dom";
import { sidebarIcon } from "../../Recents/Home";
import { ProjectWithId } from "../../dataTypes/Project";
import { DocumentWithId } from "../../dataTypes/Document";
import { Group } from "../../dataTypes/Group";
import NewDoc from "./popups/NewDoc";
import NewGroup from "./popups/NewGroup";

export const SidebarTop = styled.div`
    position: sticky;
    display: flex;
    align-items: center;
    top: 0;
`;

export const SidebarItem = styled.div`
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 0 4px 12px;
    font-size: 15px !important;
    cursor: pointer;
`;

const SidebarItemContainer = styled.div`
    min-height: calc(100vh - 140px);
    overflow: scroll;
`;

const SidebarBottom = styled.div`
    height: 44px;
    line-height: 44px;
    border-top: solid 0.5px;
    position: sticky;
    bottom: 0;
`;

export const Label = styled.span`
    border-radius: 5px;
    border: solid 0.5px;
    font-size: 14px;
    margin: 1px;
`;

// sidebar props type
type Props = {
    groups: Group[] | null,
    project?: ProjectWithId,
    current: string,
    setCurrent: (current: string) => void,
    isDarkTheme: boolean,
    mode: string,
    setMode: (mode: string) => void,
    hide: boolean, 
    setHide: (hide: boolean) => void,
    color: string,
    fileId: string,
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
}

// create sidebar
const Sidebar = ({
    groups, 
    current, setCurrent, 
    isDarkTheme, 
    mode, setMode, 
    hide, setHide, 
    color, 
    project, 
    fileId,
    errorValue, setErrorValue,
    errorDisplay, setErrorDisplay
}: Props) => {
    // state management for sections
    const [section, setSection] = useState('groups');
    const [showPopup, togglePopup] = useState(false);

    // state management for files
    const [files, setFiles] = useState<DocumentWithId[]>([]);

    let projectId = project ? project.id : "";

    async function getFiles() {
		const filesRef = collection(db, 'files');
		const q = query(filesRef, where("project", "==", projectId));

		await getDocs(q).then((querySnapshot) => {
            let filesFromDB = querySnapshot.docs.map((doc) => {
				// @ts-ignore
				const file: DocumentWithId = {id: doc.id, ...doc.data()};				
				return file;
            })
			
			setFiles(filesFromDB);
        })
    }

    useEffect(() => {
		getFiles();
    }, [project])

    // hides sidebar
    function hideSidebar() {
        if (hide) {
            return "hide "
        }

        return ""
    }

    var className = ""

    const sections = project ? ['groups', 'project', /*'characters', 'settings'*/] : ['groups', /*'characters', 'settings'*/]

	var darkTheme = getClassCode("", isDarkTheme);

    return (
        <div className={"sidebar no-select " + hideSidebar() + color + "-sidebar"}>
            <SidebarTop>
                <Select 
                    className="dropdown-spaced grow"
                    current={section}
                    darkTheme={darkTheme} 
                    color={color}
                    onChangeHandler={e => {
                        // @ts-ignore
                        setSection(e);
                    }}
                    items={sections}
                />
                {!hide ? <Button
                    color={color}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={sidebarIcon(!hide)}
                    />}
                    onClick={(e) => {
                        e.preventDefault();
                        setHide(!hide);
                    }}
                /> : null}
            </SidebarTop>
            <SidebarItemContainer>
            {section === 'groups' ?
                <SidebarItem 
                    className={color + ("view-all" === current ? "-sbar-current white-color" : "-color sbar-hoverable no-animation")} 
                    onClick={() => setCurrent("view-all")}>
                    {capitalize("view-all")}
                    <div className="grow"></div>
                    <Button
                        color={"view-all" === current ? darkTheme : color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={dotsIcon}
                        />}
                    />
                </SidebarItem> : null 
            }{section === 'groups' && groups ? groups.map((group) => {
                if (group.id === current) {
                    className = color + "-sbar-current white-color"
                } else {
                    className = color + "-color sbar-hoverable no-animation"
                }
                return (
                    <SidebarItem 
                        className={className}
                        onClick={() => setCurrent(group.id)}>
                        {capitalize(group.name)}
                        <div className="grow"></div>
                        <Button
                            color={group.id === current ? darkTheme : color}
                            border="no"
                            text={<FontAwesomeIcon 
                                icon={dotsIcon}
                            />}
                        />
                    </SidebarItem>
                )
            }) : null}
            {section === 'project' ? files.map((file) => {
                if (file.id === fileId) {
                    className = color + "-sbar-current white-color"
                } else {
                    className = color + "-color sbar-hoverable no-animation"
                }
                return (
                    <Link to={'/' + file.type + '/' + file.id}>
                    <SidebarItem className={className}>
                        {file.name}
                        <div className="grow"></div>
                        {file.id === fileId ? <>
                        <Label className={"label white-border white-color"}>{capitalize(file.type)}</Label>
                        <Button
                            color={darkTheme}
                            border="no"
                            text={<FontAwesomeIcon 
                                icon={dotsIcon}
                            />}
                        />
                        </> : <Button
                            color={color}
                            border="no"
                            text={<FontAwesomeIcon 
                                icon={dotsIcon}
                            />}
                            className="no-animation"
                        />}
                    </SidebarItem>
                    </Link>
                )
            }) : null}
            </SidebarItemContainer>
            {showPopup && (section === 'groups') ? <NewGroup 
                color={color} 
                isDarkTheme={isDarkTheme} 
                errorValue={errorValue}
                setErrorValue={setErrorValue}
                errorDisplay={errorDisplay}
                setErrorDisplay={setErrorDisplay}
                showPopup={showPopup}
                togglePopup={togglePopup}
                documentId={fileId}
                currentGroups={groups}
            /> : null}
            {showPopup && (section === 'project') ? <NewDoc 
                color={color} 
                isDarkTheme={isDarkTheme} 
                mode={mode} 
                setMode={setMode} 
                projectId={projectId} 
                currentFiles={project ? project.files : []} 
                errorValue={errorValue}
                setErrorValue={setErrorValue}
                errorDisplay={errorDisplay}
                setErrorDisplay={setErrorDisplay}
                showPopup={showPopup}
                togglePopup={togglePopup}
            /> : null}
            <SidebarBottom 
                className={color + "-color sbar-hoverable no-animation"}
                onClick={() => togglePopup(!showPopup)}>
                <FontAwesomeIcon 
                    icon={faPlus}
                />
            </SidebarBottom>
        </div>
    )
}

export default Sidebar;