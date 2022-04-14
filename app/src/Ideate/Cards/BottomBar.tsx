import React, { Dispatch, useState } from "react";
import { getClassCode } from "../../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faQuestion } from '@fortawesome/free-solid-svg-icons';

import Menu from "../../objects/Menu";
import ButtonObject from "../../objects/ButtonObject";

type Props = {
    color: string,
    isDarkTheme: boolean,
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
        }
    ];

    const rightMenu: ButtonObject[] = [
        // {
        //     id: "words",
        //     onClick: (e: Event) => {
        //         e.preventDefault();
        //     },
        //     text: wordCount()
        // },
        // {
        //     id: "timer",
        //     onClick: (e: Event) => {
        //         e.preventDefault();
        //     },
        //     text: timer()
        // },
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