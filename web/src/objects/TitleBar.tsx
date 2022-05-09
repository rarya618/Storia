import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faAngleLeft, faAngleRight, faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import { getClassCode, MacTitlebarSpacing } from "../App"
import ButtonObject from "./ButtonObject"
import { DropdownGen } from "./Dropdown"
import Menu from "./Menu"
import Toggle, { ToggleItem } from "./Toggle"
import { recentsDotDropdown } from "../resources/dropdowns"
import styled from "styled-components";

type Props = {
    mode: string,
    setMode: (mode: string) => void,
    title: string,
    isDarkTheme: boolean,
    switchTheme: (arg0: boolean) => void,
    showMenu: boolean,
    toggleMenu: (showMenu: boolean) => void
}

const Logo = styled.span`
    font-family: Norican;
    font-size: 20px;
`;

const toggleMenuIcon = (display: boolean) => {
    if (display)
        return faAngleLeft;
    
    else 
        return faAngleRight;
}

const TitleBar = (props: Props) => {
    const [showDropdown, setShowDropdown] = useState(false);

    var color = getClassCode(props.mode, props.isDarkTheme)
    const darkTheme = getClassCode("", props.isDarkTheme)
    const logo: ButtonObject[] = [
        {
            id: "logo",
            type: "link",
            onClick: "/",
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

    const leftMenuHandler: ButtonObject[] = [
        {
            id: "toggle",
            onClick: (e: Event) => {
                e.preventDefault();
                props.toggleMenu(!props.showMenu);
            },
            text: <FontAwesomeIcon icon={toggleMenuIcon(props.showMenu)} />
        }
    ]

    const rightMenu: ButtonObject[] = [{
        id: "dots",
        onClick: (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
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
        <div 
            className={"title-bar row " + color + "-color " + darkTheme + " no-select drag"}
            onClick={(e) => {
                e.preventDefault();
                setShowDropdown(false);
            }}>
            {MacTitlebarSpacing(true)}
            <Menu 
                className="no-animation"
                isDarkTheme={props.isDarkTheme} 
                color={color} 
                border={false}
                data={logo}
            />
            {props.showMenu ? <Menu 
                className="mob-hide no-animation"
                isDarkTheme={props.isDarkTheme} 
                color={color} 
                border={false}
                data={leftMenu}
            /> : null}

            <Menu 
                className="mob-hide no-animation"
                isDarkTheme={props.isDarkTheme} 
                color={color} 
                border={false}
                data={leftMenuHandler}
            />
            
            <div className="grow"></div>

            {/* <div className="absolute title-container">
                <h1 className="heading title no-animation">{props.title}</h1>
            </div> */}
            {/* <Toggle current={props.mode} setCurrent={props.setMode} isDarkTheme={props.isDarkTheme} content={viewToggle} /> */}
            <Menu 
                className="no-animation"
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