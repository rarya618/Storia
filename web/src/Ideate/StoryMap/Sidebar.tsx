import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon, faPlus } from '@fortawesome/free-solid-svg-icons';

import { capitalize, getClassCode } from "../../App";
import Button from "../../objects/Button";
import Select, { ItemType } from "../../objects/Select";
import { DocumentWithId } from "../../Recents/popups/NewFile";
import { ProjectWithId } from "../../Recents/popups/NewProject";
import { collection } from "firebase/firestore";
import { db, getDocs, query, where} from "../../firebase/config";
import { Link } from "react-router-dom";

const SidebarTop = styled.div`
    position: sticky;
    top: 0;
`;

export const SidebarItem = styled.div`
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 220px;
    padding: 6px 6px 6px 15px;
    font-size: 18px;
    cursor: pointer;
`;

const SidebarItemContainer = styled.div`
    min-height: calc(100vh - 153px);
    overflow: scroll;
`;

const SidebarBottom = styled.div`
    height: 50px;
    line-height: 50px;
    border-top: solid 0.5px;
    position: sticky;
    bottom: 0;
`;

// sidebar props type
type Props = {
    groups: string[],
    project?: ProjectWithId,
    current: string,
    setCurrent: (current: string) => void,
    isDarkTheme: boolean,
    mode: string,
    setMode: (mode: string) => void,
    hide: boolean, 
    color: string,
    fileId: string
}

// create sidebar
const Sidebar = ({groups, current, setCurrent, isDarkTheme, mode, setMode, hide, color, project, fileId}: Props) => {
    // state management for sections
    const [section, setSection] = useState('groups');

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
                className="dropdown-spaced"
                current={section}
                darkTheme={darkTheme} 
                color={color}
                onChangeHandler={e => {
                    // @ts-ignore
                    setSection(e);
                }}
                items={sections}
            />
            </SidebarTop>
            <SidebarItemContainer>
            {section === 'groups' ? groups.map((group) => {
                if (group === current) {
                    className = color + "-sidebar " + color + "-color"
                } else {
                    className = color + "-color"
                }
                return (
                    <SidebarItem 
                        className={className}
                        onClick={() => setCurrent(group)}>
                        {capitalize(group)}
                        <div className="grow"></div>
                        <Button
                            color={color}
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
                    className = color + "-sidebar " + color + "-color"
                } else {
                    className = color + "-color"
                }
                return (
                    <Link to={'/' + file.type + '/' + file.id}>
                    <SidebarItem className={className}>
                        {file.name}
                        <div className="grow"></div>
                        <Button
                            color={color}
                            border="no"
                            text={<FontAwesomeIcon 
                                icon={dotsIcon}
                            />}
                        />
                    </SidebarItem>
                    </Link>
                )
            }) : null}
            </SidebarItemContainer>
            <SidebarBottom className={color + "-color"}>
                <FontAwesomeIcon 
                    icon={faPlus}
                />
            </SidebarBottom>
        </div>
    )
}

export default Sidebar;