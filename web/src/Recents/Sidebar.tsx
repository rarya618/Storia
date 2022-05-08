import React from "react";
import styled from "styled-components";
import { capitalize } from "../App";
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
    color: string
}

export const SidebarItem = styled.div`
    text-align: left;
    display: block;
    min-width: 220px;
    padding: 12px 15px;
    font-size: 18px;
    cursor: pointer
`;

// create sidebar
const Sidebar = ({elements, current, setCurrent, isDarkTheme, mode, setMode, hide, color}: Props) => {
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
            <Create color={color} isDarkTheme={isDarkTheme} mode={mode} setMode={setMode} />

            {elements.map((element) => {
                if (element === current) {
                    className = color + "-sidebar " + color + "-color"
                } else {
                    className = color + "-color"
                }
                return (
                    <SidebarItem 
                        className={className}
                        onClick={() => setCurrent(element)}>
                        My {capitalize(element)}s
                    </SidebarItem>
                )
            })}
        </div>
    )
}

export default Sidebar;