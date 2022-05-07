import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import { getClassCode, MacTitlebarSpacing } from "../App"
import ButtonObject from "../objects/ButtonObject"
import { DropdownGen } from "../objects/Dropdown"
import Menu from "../objects/Menu"
import Toggle, { ToggleItem } from "../objects/Toggle"
import { recentsDotDropdown } from "../resources/dropdowns"
import styled from "styled-components";

type Props = {
    mode: string,
    setMode: (mode: string) => void,
    title: string,
    isDarkTheme: boolean,
    switchTheme: (arg0: boolean) => void
}

const Logo = styled.span`
    font-family: Norican;
    font-size: 20px;
`;

const TitleBar = (props: Props) => {
    const [showDropdown, setShowDropdown] = useState(false);

    var color = getClassCode(props.mode, props.isDarkTheme)
    const darkTheme = getClassCode("", props.isDarkTheme)
    const logo: ButtonObject[] = [
        {
            id: "logo",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: <Logo>Storia</Logo>
        }
    ]

    const leftMenu: ButtonObject[] = [
        {
            id: "file",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: "File"
        },
        {
            id: "edit",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: "Edit"
        },
        {
            id: "view",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: "View"
        },
        {
            id: "insert",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: "Insert"
        },
        {
            id: "tools",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: "Tools"
        },
        {
            id: "help",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: "Help"
        },
    ];

    const rightMenu: ButtonObject[] = [{
        id: "dots",
        onClick: (e: Event) => {
            e.preventDefault();
            setShowDropdown(!showDropdown);
        },
        text: <FontAwesomeIcon icon={dotsIcon} />
    }];

    let viewToggle: ToggleItem[] = [
        {
            id: "write",
            display: "Writing", 
            color: getClassCode("write", props.isDarkTheme)
        },
        {
            id: "ideate",
            display: "Ideating", 
            color: getClassCode("ideate", props.isDarkTheme)
        }
    ]
    
    return (
        <div className={"title-bar row " + color + "-color " + darkTheme + " no-select drag"}>
            {MacTitlebarSpacing(true)}
            <Menu 
                className="top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={color} 
                border={false}
                data={logo}
            />
            <Menu 
                className="top-layer mob-hide"
                isDarkTheme={props.isDarkTheme} 
                color={color} 
                border={false}
                data={leftMenu}
            />
            <div className="grow"></div>

            {/* <div className="absolute title-container">
                <h1 className="heading title no-animation">{props.title}</h1>
            </div> */}
            {/* <Toggle current={props.mode} setCurrent={props.setMode} isDarkTheme={props.isDarkTheme} content={viewToggle} /> */}
            <Menu 
                className="top-layer"
                isDarkTheme={props.isDarkTheme} 
                color={color} 
                border={false}
                data={rightMenu}
            />
            {
                showDropdown 
                ? DropdownGen(
                    color, 
                    props.isDarkTheme, 
                    recentsDotDropdown(props.isDarkTheme, props.switchTheme)
                ) : null
            }
        </div>
    )
}

export default TitleBar;