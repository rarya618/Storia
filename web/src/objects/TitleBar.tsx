import React, { MouseEventHandler, useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faAngleDown, faAngleLeft, faAngleRight, faAngleUp, faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import { getClassCode, MacTitlebarSpacing } from "../App"
import ButtonObject from "./ButtonObject"
import { DropdownGen, Item } from "./Dropdown"
import Menu from "./Menu"
import styled from "styled-components";
import { db, getDoc } from "../firebase/config";
import { User } from "../dataTypes/User";
import { divider, signOut } from "../resources/dropdowns";

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
    font-size: 18px;
`;

// recents dot dropdown
export const accountDropdown: Item[] = [
    {id: "account", display: "Account"},
    {id: "settings", display: "Settings"},
    divider,
    {id: "bookmarks", display: "Bookmarks"},
    {id: "trash", display: "Trash"},
    divider,
    {id: "stats", display: "Statistics"},
    {id: "resources", display: "Resources"},
    divider,
    signOut
]

const toggleMenuIcon = (display: boolean) => {
    if (display)
        return faAngleLeft;
    
    else 
        return faAngleRight;
}

type AccountProps = {
    data: ButtonObject,
    color: string,
    border?: string,
}

const AccountText = styled.span`
    font-size: 13px;
    padding: 0 8px 0 1px;
`;

const AccountBtn = styled.button`
    height: 26px;
    border: none;
    border-radius: 14px;
    padding: 0 10px;
    margin: 6px 3px;
`;

const AccountButton = ({color, data, border}: AccountProps) => {
    return (
        <AccountBtn 
            className={color + "-color no-animation " 
            + color + "-view hoverable no-select"} 
            // @ts-ignore
            onClick={data.onClick} 
            id={data.id}>
            {data.text}
        </AccountBtn>
    )
}

const TitleBar = (props: Props) => {
    const [showDropdown, setShowDropdown] = useState(false);

	const userCode = sessionStorage.getItem("userCode");
	const userId = sessionStorage.getItem("userId");

    const [details, setDetails] = useState<User>();

    async function getDetails(userCode: string | null) {
        if (userCode) {
            const docRef = db.collection('users').doc(userCode);

            // @ts-ignore
            const tempDoc: User = (await getDoc(docRef)).data();
            
            if (tempDoc) {
                setDetails(tempDoc);
            }
        }
    }

    // call function
    useEffect(() => {
        getDetails(userCode);
    }, [userCode])

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

    const accountButton: ButtonObject = userCode ? {
        id: "user",
        text: <div className="row align-center no-animation">
            <AccountText>{details ? details.firstName + " " + details.lastName : userId}</AccountText>
            <FontAwesomeIcon className="no-animation size-14" icon={showDropdown ? faAngleUp : faAngleDown} />
        </div>,
        onClick: (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDropdown(!showDropdown);
        }
    } : {
        id: "guest",
        text: "Guest"
    }
    
    return (
        <div 
            className={"title-bar bottomBorder row " + color + "-color " + darkTheme + " no-select drag"}
            onClick={(e) => {
                e.preventDefault();
                setShowDropdown(false);
            }}>
            {/* {MacTitlebarSpacing(true)} */}
            {/* Not to display for Mac */}
            <Menu 
                className="no-animation"
                isDarkTheme={props.isDarkTheme} 
                color={color} 
                border={false}
                data={logo}
            />
            {userId ? <>{props.showMenu ? <Menu 
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
            /></> : null}
            
            <div className="grow"></div>

            {/* <div className="absolute title-container">
                <h1 className="heading title no-animation">{props.title}</h1>
            </div> */}
            {/* <Toggle current={props.mode} setCurrent={props.setMode} isDarkTheme={props.isDarkTheme} content={viewToggle} /> */}
            <AccountButton 
                data={accountButton} 
                color={color}
                border="no"
            />
            {
                showDropdown && userId
                ? DropdownGen(
                    color, 
                    props.isDarkTheme, 
                    accountDropdown
                ) : null
            }
        </div>
    )
}

export default TitleBar;