import React, { Dispatch, useState } from "react";
import Toggle from "react-toggle";
import { getClassCode } from "../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareSquare, faBars, faUndo, faRedo, faHome, faEllipsisH} from '@fortawesome/free-solid-svg-icons';

// @ts-ignore
import Menu from "./Menu";
import { getElementName, timer, wordCount } from "./Page";

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

export type ButtonObject = {
    id: string;
    type?: string;
    text: string | JSX.Element;
    onClick?: string | ((e: Event) => void);
}


const TitleBar = (props: Props) => {
    const [border, setBorder] = useState(false);

    const leftMenu: ButtonObject[] = [
        {
            id: "sidebar",
            onClick: (e: Event) => {
                e.preventDefault();
                props.setHideSidebar(!props.hideSidebar);
            },
            text: <FontAwesomeIcon icon={faBars} />
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
        },
        {
            id: "home",
            type: "link",
            onClick: "/",
            text: <FontAwesomeIcon icon={faHome} />
        },
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
            id: "element",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: getElementName(props.currentElementType)
        },
        {
            id: "words",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: wordCount()
        },
        {
            id: "timer",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: timer()
        },
        {
            id: "share",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={faShareSquare} />
        },
        {
            id: "dots",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={faEllipsisH} />
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
            <div className="absolute full-width">
                <h1 className="heading title no-animation">{props.title}</h1>
            </div>
            <Menu 
                className="absolute push-right top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={rightMenu}
            />
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