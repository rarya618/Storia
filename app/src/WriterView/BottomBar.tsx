import React, { Dispatch, useState } from "react";
import { getClassCode } from "../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faQuestion } from '@fortawesome/free-solid-svg-icons';

// @ts-ignore
import Menu from "./Menu";
import { ButtonObject, getElementName, timer, wordCount } from "./Page";

type Props = {
    color: string,
    isDarkTheme: boolean,
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


const BottomBar = (props: Props) => {
    const [border, setBorder] = useState(false);

    const leftMenu: ButtonObject[] = [
        {
            id: "home",
            type: "link",
            onClick: "/",
            text: <FontAwesomeIcon icon={faHome} />
        },
        {
            id: "element",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: getElementName(props.currentElementType)
        }
    ];

    const rightMenu: ButtonObject[] = [
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
            id: "help",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <FontAwesomeIcon icon={faQuestion} />
        }
    ];

    

    return (
        <div className={"bottom-bar row no-select drag " + props.color + "-color " + getClassCode("", props.isDarkTheme)}>
            <Menu 
                className="top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={leftMenu}
            />
            
            <Menu 
                className="absolute push-right top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={props.color} 
                border={border}
                data={rightMenu}
            />
            
        </div>
        
    )
}

export default BottomBar;