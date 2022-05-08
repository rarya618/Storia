import React from "react";
import { capitalize } from "../App";
import { SidebarItem } from "../Recents/Sidebar";
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
    color: string,
    projectId: string,
    projectFiles: string[]
}

// create sidebar
const Sidebar = ({
    elements, 
    current, 
    setCurrent, 
    isDarkTheme, 
    mode, 
    setMode,
    hide, 
    color, 
    projectId,
    projectFiles
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
            <Create 
                color={color} 
                isDarkTheme={isDarkTheme} 
                mode={mode} 
                setMode={setMode} 
                projectId={projectId} 
                currentFiles={projectFiles}
            />
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
                        {capitalize(element)}
                    </SidebarItem>
                )
            })}
        </div>
    )
}

export default Sidebar;