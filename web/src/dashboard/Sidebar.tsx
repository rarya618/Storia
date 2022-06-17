import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import { capitalize } from "../App";
import { StringOrProjectWithId } from "../dataTypes/Project";
import Button from "../objects/Button";
import { SidebarItemContainer } from "../projectView/Sidebar";
import { sidebarIcon } from "./Home";
import { SidebarItem, SidebarTop, ViewAll } from "../objects/Sidebar";
import Create from "./popups/Create";

// sidebar props type
type Props = {
    elements: StringOrProjectWithId[],
    current: StringOrProjectWithId,
    setCurrent: (current: StringOrProjectWithId) => void,
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
                <ViewAll 
                    className={("view-all" === current) ? color + "-sbar-current white-color" : color + "-color sbar-hoverable no-animation"}
                    onClick={() => setCurrent("view-all")}>
                    View All
                </ViewAll>
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
                if (typeof element === "string") {
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
                } else {
                    if (element.id === current || (typeof current !== "string" && element.id === current.id)) {
                        className = color + "-sbar-current white-color"
                    } else {
                        className = color + "-color sbar-hoverable no-animation"
                    }
                    return (
                        <SidebarItem 
                            className={className}
                            onClick={() => setCurrent(element)}>
                            {element.name}
                        </SidebarItem>
                    )
                }
            })}
            </SidebarItemContainer>
        </div>
    )
}

export default Sidebar;