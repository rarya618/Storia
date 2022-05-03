import React, { Dispatch, useState } from "react";
import { getClassCode, MacTitlebarSpacing } from "../../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareSquare as shareIcon, faFolder, faAngleDoubleLeft as sidebarOpen, faBars as sidebarClose, faUndo, faRedo, faHome, faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import Menu from "../../objects/Menu";
import { DropdownGen } from "../../objects/Dropdown";
import { writerDotDropdown } from "../../resources/dropdowns";
import ButtonObject from "../../objects/ButtonObject";

type Props = {
    title: string,
    color: string,
    status: string,
    isDarkTheme: boolean,
    hideSidebar: boolean,
    setHideSidebar: Dispatch<boolean>,
    switchTheme: (arg0: boolean) => void
};

const sidebarIcon = (display: boolean) => {
    if (display)
        return sidebarOpen;
    
    else 
        return sidebarClose;
}

const TitleBar = (props: Props) => {    
    const [border, setBorder] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);

    const leftMenu: ButtonObject[] = [
        // {
        //     id: "sidebar",
        //     onClick: (e: Event) => {
        //         e.preventDefault();
        //         props.setHideSidebar(!props.hideSidebar);
        //     },
        //     text: <FontAwesomeIcon icon={sidebarIcon((!props.hideSidebar))} />
        // },
        // {
        //     id: "main-menu",
        //     onClick: (e: Event) => {
        //         e.preventDefault();
        //     },
        //     text: <FontAwesomeIcon icon={faFolder} />
        // },
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
                setShowDropdown(!showDropdown);
            },
            text: <FontAwesomeIcon icon={dotsIcon} />
        }
    ];

    return (
        <div className={"title-bar row no-select drag " + props.color + "-color " + getClassCode("", props.isDarkTheme)}>
            {/* For macOS build only */}
            {MacTitlebarSpacing(props.hideSidebar)}

            <Menu 
                className="top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={leftMenu}
            />
            <div className="absolute title-container no-animation">
                <h1 className="heading title no-animation">{props.title}</h1>
            </div>
            
            <Menu 
                className="absolute push-right top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={rightMenu}
            />
            {showDropdown ? DropdownGen(props.color, props.isDarkTheme, writerDotDropdown(props.isDarkTheme, props.switchTheme)) : null}
        </div>
        
    )
}

export default TitleBar;