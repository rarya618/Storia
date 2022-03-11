import React, { Dispatch, useState } from "react";
import Toggle from "react-toggle";
import { getClassCode } from "../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareSquare as shareIcon, faFolder, faAngleDoubleLeft as sidebarOpen, faBars as sidebarClose, faUndo, faRedo, faHome, faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

// @ts-ignore
import Menu from "./Menu";
import { ButtonObject, getElementName, timer, wordCount } from "./Page";
import Dropdown, { Item } from "../objects/Dropdown";

type Props = {
    title: string,
    color: string,
    status: string,
    setStatus: Dispatch<string>,
    isDarkTheme: boolean,
    hideSidebar: boolean,
    setHideSidebar: Dispatch<boolean>,
    currentElementType: string,
    setCurrentElementType: Dispatch<string>,
    switchTheme: (arg0: boolean) => void
};

const macOverlay = (display: boolean) => {
    if (display) {
        return "mac-overlay";
    } else {
        return "mac-overlay hide";
    }
}

const sidebarIcon = (display: boolean) => {
    if (display)
        return sidebarOpen;
    
    else 
        return sidebarClose;
}

// dot dropdown
const dotDropdown: Item[] = [
    {id: "copy", display: "Create a Copy"},
    {id: "bookmark", display: "Bookmark"},
    {id: "delete", display: "Delete"},
    {id: "divider"},
    {id: "dark", display: "Dark Mode"},
    {id: "big", display: "Bigger Text"},
    {id: "divider"},
    {id: "versions", display: "Versions"},
    {id: "comments", display: "Comments"},
    {id: "stats", display: "Statistics"},
    {id: "details", display: "Project Details"},
    {id: "divider"},
    {id: "account", display: "Account"},
    {id: "resources", display: "Resources"},
    {id: "divider"},
]


const TitleBar = (props: Props) => {    
    const DropdownGen = (content: Item[]) => {
        return (
            <Dropdown 
                color={props.color}
                isDarkTheme={props.isDarkTheme} 
                content={content}
            />
        )
    }
    const [border, setBorder] = useState(false);

    const leftMenu: ButtonObject[] = [
        {
            id: "sidebar",
            onClick: (e: Event) => {
                e.preventDefault();
                props.setHideSidebar(!props.hideSidebar);
            },
            text: <FontAwesomeIcon icon={sidebarIcon((!props.hideSidebar))} />
        },
        {
            id: "main-menu",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={faFolder} />
        },
        {
            id: "undo",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={faUndo} />
        },
        {
            id: "redo",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={faRedo} />
        }
    ];

    const rightMenu: ButtonObject[] = [
        {
            id: "status",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: props.status
        },
        {
            id: "share",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={shareIcon} />
        },
        {
            id: "dots",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={dotsIcon} />
        }
    ];

    return (
        <div className={"title-bar row no-select drag " + props.color + "-color " + getClassCode("", props.isDarkTheme)}>
            {/* For macOS build only */}
            <div className={macOverlay(props.hideSidebar)}></div>

            <Menu 
                className="top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={leftMenu}
            />
            <div className="absolute title-container">
                <h1 className="heading title no-animation">{props.title}</h1>
            </div>
            
            <Menu 
                className="absolute push-right top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={rightMenu}
            />
            {DropdownGen(dotDropdown)}

            {/* <Toggle
                className={"dark-mode-toggle absolute push-right push-up-medium"}
                checked={props.isDarkTheme}
                onChange={({ target }) => props.switchTheme(target.checked)}
                icons={{ checked: "🌙", unchecked: "🔥" }}
                aria-label="Dark mode toggle"
            /> */}
            
        </div>
        
    )
}

export default TitleBar;