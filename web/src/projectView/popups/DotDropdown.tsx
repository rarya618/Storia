import React from "react";
import { useState } from "react";
import { DropdownGen, Item } from "../../objects/Dropdown";
import { ProjectWithId } from "../../Recents/popups/NewProject";
import { divider } from "../../resources/dropdowns";
import RenameProject from "./Rename";

type Props = {
    showDropdown: boolean,
    toggleDropdown: (e: boolean) => void,
    classCode: string,
    isDarkTheme: boolean,
    project: ProjectWithId | null,
    topBar?: boolean
};

const ProjectDropdown = (props: Props) => {
    // popup toggle
    const [currentSetting, setCurrentSetting] = useState("none");

    const toggle = (setting: string) => {
        setCurrentSetting(setting);
        props.toggleDropdown(false)
    }
    
    const dotDropdown: Item[] = [
        {
            id: "statistics", 
            display: "Statistics"
        },
        {
            id: "project-info", 
            display: "Project Info"
        },
        divider,
        {
            id: "share",
            display: "Share"
        },
        {
            id: "bookmark", 
            display: "Bookmark"
        },
        divider,
        {
            id: "rename",
            display: "Rename", 
            onClick: () => toggle("rename")
        },
        {
            id: "delete", 
            display: "Delete"
        },
    ]

    return (
        <>
        <div className={props.topBar ? "absolute push-right no-push-up" : ""}>
            {/* setup dropdown */}
            {props.showDropdown 
            ? DropdownGen(
                props.classCode, 
                props.isDarkTheme, 
                dotDropdown
            ) : null}
        </div>
        {props.topBar ? 
            <div className="absolute push-right no-push-up">
                {/* setup rename popup */}
                {currentSetting === "rename" ? <RenameProject 
                    project={props.project}
                    color={props.classCode} 
                    isDarkTheme={props.isDarkTheme}
                    closePopup={() => {setCurrentSetting("none")}}
                /> : null}
            </div> : (currentSetting === "rename" ? <RenameProject 
                project={props.project}
                color={props.classCode} 
                isDarkTheme={props.isDarkTheme}
                closePopup={() => {setCurrentSetting("none")}}
            /> : null)
        }
        </>
    )
}

export default ProjectDropdown;