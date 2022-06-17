import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useState } from "react";
import { DropdownGen, Item } from "../../../objects/Dropdown";
import { divider } from "../../../resources/dropdowns";

type Props = {
    showDropdown: boolean,
    toggleDropdown: (e: boolean) => void,
    classCode: string,
    className?: string,
    isDarkTheme: boolean,
    topBar?: boolean,
    edit?: () => void,
    groupView?: () => void,
};

const BlockDropdown = (props: Props) => {
    // popup toggle
    const [currentSetting, setCurrentSetting] = useState("none");

    const toggle = (setting: string) => {
        setCurrentSetting(setting);
        props.toggleDropdown(false)
    }
    
    const dropdown: Item[] = [
        {
            id: "edit",
            display: <div className="row flex-space-between">
                <div>Edit</div>
                <div>
                    <FontAwesomeIcon icon={faPen} />
                </div>
            </div>,
            onClick: props.edit
        },
        // {
        //     id: "delete", 
        //     display: "Delete"
        // },
        divider,
        {
            id: "groups", 
            display: "Manage Groups",
            onClick: props.groupView
        },
        // {
        //     id: "new", 
        //     display: "New Block"
        // },
        // divider,
        // {
        //     id: "reorder",
        //     display: "Reorder"
        // },
        // {
        //     id: "move", 
        //     display: "Move"
        // }
    ]

    const className = props.className ? props.className : "absolute";

    return (<>
        <div className={className}
        onClick={(e)=> {
            e.stopPropagation()
        }}>
            {/* setup dropdown */}
            {props.showDropdown 
            ? DropdownGen(
                props.classCode, 
                props.isDarkTheme, 
                dropdown,
                true
            ) : null}
        </div>
        {/* {props.topBar ? 
            <div className="absolute push-right no-push-up"> */}
                {/* setup rename popup */}
                {/* {currentSetting === "edit" ? <RenameProject 
                    project={props.project}
                    color={props.classCode} 
                    isDarkTheme={props.isDarkTheme}
                    closePopup={() => {setCurrentSetting("none")}}
                /> : null}
            </div> : (currentSetting === "edit" ? <RenameProject 
                project={props.project}
                color={props.classCode} 
                isDarkTheme={props.isDarkTheme}
                closePopup={() => {setCurrentSetting("none")}}
            /> : null)
        } */}
    </>)
}

export default BlockDropdown;