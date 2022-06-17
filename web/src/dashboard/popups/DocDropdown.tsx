import React from "react";
import { useState } from "react";
import { DocumentWithId } from "../../dataTypes/Document";
import { DropdownGen, Item } from "../../objects/Dropdown";
import { divider } from "../../resources/dropdowns";
import AddDocToProject from "./AddDocToProject";
import ChangeProject from "./ChangeProject";
import RenameDocument from "./RenameDoc";

type Props = {
    projectId: string
    showDropdown: boolean,
    toggleDropdown: (e: boolean) => void,
    classCode: string,
    isDarkTheme: boolean,
    file: DocumentWithId
};

const DocumentDropdown = (props: Props) => {
    // popup toggle
    const [showPopup, togglePopup] = useState(false);
    const [currentSetting, setCurrentSetting] = useState("none");

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
        {
            id: "statistics", 
            display: "Statistics"
        },
        {
            id: "doc-info", 
            display: "Document Info"
        },
        divider,
        projectSettings(props.projectId),
        {id: "share", display: "Share"},
        {id: "bookmark", display: "Bookmark"},
        divider,
        renameDoc,
        {
            id: "delete", 
            display: "Delete"
        },
    ] : [
        {
            id: "guest", 
            display: "Welcome, Guest!"
        },
        divider,
        renameDoc,
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

export default DocumentDropdown;