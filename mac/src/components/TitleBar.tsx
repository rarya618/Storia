import React, { Dispatch, useState } from "react";
import Toggle from "react-toggle";
import { getClassCode } from "../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareSquare, faBars, faUndo, faRedo, faHome, faEllipsisH} from '@fortawesome/free-solid-svg-icons';

// @ts-ignore
import Menu from "./Menu";

type Props = {
    title: string,
    color: string,
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
    text: JSX.Element;
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
            <div className={macOverlay(props.hideSidebar)}></div>
            <Menu 
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={leftMenu}
            />
            <h1 className="heading title no-animation">{props.title}</h1>
            <Menu 
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