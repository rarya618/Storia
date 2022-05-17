import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import { capitalize } from "../App";
import { SidebarTop } from "../Ideate/StoryMap/Sidebar";
import Button from "../objects/Button";
import { SidebarItemContainer } from "../projectView/Sidebar";
import { sidebarIcon } from "./Home";
import Create from "./popups/Create";

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
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
}

export const SidebarItem = styled.div`
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 220px;
    padding: 12px 15px;
    font-size: 15px;
    cursor: pointer;
`;

// create sidebar
const Sidebar = ({
    elements, 
    current, setCurrent, 
    isDarkTheme, 
    mode, setMode, 
    hide, setHide, 
    color,
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
                        My {capitalize(element)}s
                    </SidebarItem>
                )
            })}
            </SidebarItemContainer>
        </div>
    )
}

export default Sidebar;