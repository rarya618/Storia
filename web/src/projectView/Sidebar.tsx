import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { capitalize } from "../App";
import { SidebarTop } from "../Ideate/StoryMap/Sidebar";
import Button from "../objects/Button";
import { sidebarIcon } from "../Recents/Home";
import { SidebarItem } from "../Recents/Sidebar";
import Create from "./popups/Create";

export const SidebarItemContainer = styled.div`
    min-height: calc(100vh - 103px);
    overflow: scroll;
`;

// sidebar props type
type Props = {
    elements: string[],
    current: string,
    setCurrent: (current: string) => void,
    isDarkTheme: boolean,
    mode: string,
    setMode: (mode: string) => void,
    hide: boolean, 
    setHide: (hide: boolean) => void,
    color: string,
    projectId: string,
    projectFiles: string[],
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
}

// create sidebar
const Sidebar = ({
    elements, 
    current, setCurrent, 
    isDarkTheme, 
    mode, setMode,
    hide, setHide,
    color, 
    projectId,
    projectFiles,
    errorValue, setErrorValue,
    errorDisplay, setErrorDisplay
}: Props) => {
    // hides sidebar
    function hideSidebar() {
        if (hide) {
            return "hide "
        }

        return ""
    }

    var className = ""

    return (
        <div className={"sidebar no-select " + hideSidebar() + color + "-sidebar"}>
            <SidebarTop>
                <Create 
                    color={color} 
                    isDarkTheme={isDarkTheme} 
                    mode={mode} 
                    setMode={setMode} 
                    projectId={projectId} 
                    currentFiles={projectFiles}
                    errorValue={errorValue}
                    setErrorValue={setErrorValue}
                    errorDisplay={errorDisplay}
                    setErrorDisplay={setErrorDisplay}
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
            {elements.map((element) => {
                if (element === current) {
                    className = color + "-sbar-current white-color"
                } else {
                    className = color + "-color sbar-hoverable no-animation"
                }
                return (
                    <SidebarItem 
                        className={className}
                        onClick={() => setCurrent(element)}>
                        {capitalize(element)}
                    </SidebarItem>
                )
            })}
            </SidebarItemContainer>
        </div>
    )
}

export default Sidebar;