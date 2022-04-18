import React, { useState } from "react";
import { CreateBottomBar } from "../../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faQuestion } from '@fortawesome/free-solid-svg-icons';

import ButtonObject from "../../objects/ButtonObject";

type Props = {
    color: string,
    isDarkTheme: boolean,
    blockCount: number,
    switchTheme: (arg0: boolean) => void
};

const BottomBar = (props: Props) => {
    const [border, setBorder] = useState(false);

    const leftMenu: ButtonObject[] = [
        {
            id: "card-count",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: props.blockCount + " cards"
        },
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

    

    return CreateBottomBar(props.isDarkTheme, border, props.color, leftMenu, rightMenu);
}

export default BottomBar;