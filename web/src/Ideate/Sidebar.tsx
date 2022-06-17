import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon, faPlus } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode } from "../App";
import Button from "../objects/Button";
import Select, { ItemType } from "../objects/Select";
import { collection } from "firebase/firestore";
import { db, getDocs, query, where} from "../firebase/config";
import { Link } from "react-router-dom";
import { sidebarIcon } from "../dashboard/Home";
import { ProjectWithId } from "../dataTypes/Project";
import { DocumentWithId } from "../dataTypes/Document";
import { Group } from "../dataTypes/Group";
import NewDoc from "./StoryMap/popups/NewDoc";
import NewGroup from "./StoryMap/popups/NewGroup";
import { CharacterWithId } from "../dataTypes/Character";
import { characterFilterGen, defaultGroup, Filter, groupFilterGen } from "../dataTypes/Filter";
import { SidebarItem, SidebarItemAlt, SidebarTop } from "../objects/Sidebar";

const SidebarItemContainer = styled.div`
    min-height: calc(100vh - 100px);
    overflow: scroll;
`;

const bottomHeight = 40;

const SidebarBottom = styled.div`
    height: ${bottomHeight}px;
    line-height: ${bottomHeight}px;
    position: sticky;
    bottom: 0;
`;

export const Label = styled.span`
    border-radius: 3px;
    border: solid 0.5px;
    font-size: 12px;
    padding: 3px 6px;
    margin: 1px;
`;

// sidebar props type
type Props = {
    groups: Group[] | null,
    project?: ProjectWithId,
    characters?: CharacterWithId[],
    current: Filter,
    setCurrent: (current: Filter) => void,
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
    reloadFileData: () => Promise<void>;
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
    characters,
    fileId,
    errorValue, setErrorValue,
    errorDisplay, setErrorDisplay,
    reloadFileData
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

    const sections = project ? ['groups', 'project', 'characters'] : ['groups']

	var darkTheme = getClassCode("", isDarkTheme);
    if (section === 'groups') { 
        current === defaultGroup
        ? className = color + "-sbar-current white-color no-animation"
        : className = color +  "-color sbar-hoverable no-animation"
    };

    return (
        <div className={"sidebar no-select " + hideSidebar() + color + "-sidebar"}>
            <SidebarTop className="purple-sidebar">
                <Select 
                    className="dropdown-spaced grow"
                    current={section}
                    darkTheme={darkTheme} 
                    color={color}
                    onChangeHandler={e => {
                        // @ts-ignore
                        setSection(e);
                        if (e === 'groups') {
                            setCurrent(defaultGroup)
                        }
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
            {section === 'groups' && groups ? <>
                <SidebarItem 
                    className={className} 
                    onClick={() => setCurrent(defaultGroup)}>
                    {capitalize("view-all")}
                    <div className="grow"></div>
                </SidebarItem>
                {groups.map((group) => {
                    return (
                        group.id === current.value ?
                        <SidebarItemAlt 
                            className={color + "-sbar-current white-color"}
                            onClick={() => setCurrent(groupFilterGen(group.id))}>
                            {capitalize(group.name)}
                            <div className="grow"></div>
                            <Button
                                color={darkTheme}
                                border="no"
                                text={<FontAwesomeIcon 
                                    icon={dotsIcon}
                                />}
                            />
                        </SidebarItemAlt> : <SidebarItem
                            className={color + "-color sbar-hoverable no-animation"}
                            onClick={() => setCurrent(groupFilterGen(group.id))}>
                            {capitalize(group.name)}
                            <div className="grow"></div>
                        </SidebarItem>
                    )
                })}
            </> : null}
            {section === 'project' ? files.map((file) => {
                if (file.id === fileId) {
                    className = color + "-sbar-current white-color"
                } else {
                    className = color + "-color sbar-hoverable no-animation"
                }
                return (
                    <Link to={'/' + file.type + '/' + file.id}>{ file.id === fileId ?
                        <SidebarItemAlt className={className}>
                            {file.name}
                            <div className="grow"></div>
                            <Label className={"white-border white-color"}>{capitalize(file.type)}</Label>
                            <Button
                                color={darkTheme}
                                border="no"
                                text={<FontAwesomeIcon 
                                    icon={dotsIcon}
                                />}
                            />
                        </SidebarItemAlt>
                        : <SidebarItem className={className}>
                            {file.name}
                            <div className="grow"></div>
                        </SidebarItem>
                    }</Link>
                )
            }) : null}
            {section === 'characters' && characters ? <>
                {characters.map((character) => {
                    return (
                        character.id === current.value ?
                        <SidebarItemAlt 
                            className={color + "-sbar-current white-color"}
                            onClick={() => setCurrent(characterFilterGen(character.id))}>
                            {capitalize(character.name)}
                            <div className="grow"></div>
                            <Button
                                color={darkTheme}
                                border="no"
                                text={<FontAwesomeIcon 
                                    icon={dotsIcon}
                                />}
                            />
                        </SidebarItemAlt> : <SidebarItem
                            className={color + "-color sbar-hoverable no-animation"}
                            onClick={() => setCurrent(characterFilterGen(character.id))}>
                            {capitalize(character.name)}
                            <div className="grow"></div>
                        </SidebarItem>
                    )
                })}
            </> : null}
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
                onCreate={reloadFileData}
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
                className={color + "-color purple-sidebar sbar-hoverable no-animation"}
                onClick={() => togglePopup(!showPopup)}>
                <FontAwesomeIcon 
                    icon={faPlus}
                />
            </SidebarBottom>
        </div>
    )
}

export default Sidebar;