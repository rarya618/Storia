import React, { Dispatch, useState } from "react";
import { CreateBottomBar, getClassCode } from "../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faQuestion } from '@fortawesome/free-solid-svg-icons';

import { getElementName, timer, wordCount } from "./Page";
import ButtonObject from "../objects/ButtonObject";

type Props = {
    color: string,
    isDarkTheme: boolean,
    currentElementType: string,
    setCurrentElementType: Dispatch<string>,
    switchTheme: (arg0: boolean) => void
};

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

    return CreateBottomBar(props.isDarkTheme, border, props.color, leftMenu, rightMenu);
}

export default BottomBar;