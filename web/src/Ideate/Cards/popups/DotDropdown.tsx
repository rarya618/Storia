import React from "react";
import { useState } from "react";
import AddDocToProject from "../../../dashboard/popups/AddDocToProject";
import ChangeProject from "../../../dashboard/popups/ChangeProject";
import RenameDocument from "../../../dashboard/popups/RenameDoc";
import { DocumentWithId } from "../../../dataTypes/Document";
import { DropdownGen, Item } from "../../../objects/Dropdown";
import { divider } from "../../../resources/dropdowns";

type Props = {
    projectId: string
    showDropdown: boolean,
    toggleDropdown: (e: boolean) => void,
    classCode: string,
    isDarkTheme: boolean,
    file: DocumentWithId
};

const DotDropdown = (props: Props) => {
    // popup toggle
    const [showPopup, togglePopup] = useState(false);
    const [currentSetting, setCurrentSetting] = useState("none");

	const userCode = sessionStorage.getItem("userCode");
	const userId = sessionStorage.getItem("userId");

    const toggle = (setting: string) => {
        togglePopup(true)
        setCurrentSetting(setting);
        props.toggleDropdown(false)
    }
    
    const projectSettings = (projectId: string): Item => {
        return {
            id: "project-settings", 
            display: (projectId === "" ? "Assign Project" : "Project Settings"),
            onClick: () => toggle("project-settings")
        }
    };

    const renameDoc: Item = {
        id: "rename", 
        display: "Rename",
        onClick: () => toggle("rename")
    }

    const dotDropdown: Item[] = userId ? [
        renameDoc,
        {
            id: "delete", 
            display: "Delete"
        },
        divider,
        {id: "share", display: "Share"},
        {id: "bookmark", display: "Bookmark"},
        divider,
        {
            id: "comments", 
            display: "Comments"
        },
        {
            id: "statistics", 
            display: "Statistics"
        },
        divider,
        projectSettings(props.projectId),
        {
            id: "doc-info", 
            display: "Details"
        },
    ] : [
        {
            id: "guest", 
            display: "Welcome, Guest!"
        },
        divider,
        renameDoc    
    ]

    const classCode = "top-layer " + props.classCode

    return (<>
        {showPopup && currentSetting === "project-settings" ? (props.projectId === "" ? 
            <AddDocToProject 
                color={classCode} 
                isDarkTheme={props.isDarkTheme}
                closePopup={() => togglePopup(false)}
                file={props.file}
            /> : <ChangeProject 
                color={classCode} 
                isDarkTheme={props.isDarkTheme}
                closePopup={() => togglePopup(false)}
                file={props.file}
            />
        ) : null}
        {/* setup rename popup */}
        {showPopup && currentSetting === "rename" ? <RenameDocument 
            document={props.file}
            color={props.classCode} 
            isDarkTheme={props.isDarkTheme}
            closePopup={() => {setCurrentSetting("none")}}
        /> : null}
        {props.showDropdown 
        ? DropdownGen(
            props.classCode, 
            props.isDarkTheme, 
            dotDropdown
        ) : null}
    </>)
}

export default DotDropdown;