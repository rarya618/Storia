import React, {useEffect, useState} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, MacTitlebarSpacing} from '../App';

import Files from './Files';

import { setTitleForBrowser } from '../resources/title';
import { recentsDotDropdown } from '../resources/dropdowns';

import { DropdownGen } from '../objects/Dropdown';
import Menu from '../objects/Menu';
import Toggle, { ToggleItem } from '../objects/Toggle';
import ButtonObject from '../objects/ButtonObject';

import { db } from '../firebase/config';
import { Navigate } from 'react-router-dom';
import Create from './popups/Create';
import Projects from './Projects';

type Props = { 
    isDarkTheme: boolean; 
    mode: string;
    setMode: (e: string) => void; 
    switchTheme: (arg0: boolean) => void; 
}

const getDetails = async (uid: string) => {
    return await db.collection("users").doc(uid).get()
    .then(snapshot => snapshot.data())
}

const Home = (props: Props) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const rightMenu: ButtonObject[] = [{
        id: "dots",
        onClick: (e: Event) => {
            e.preventDefault();
            setShowDropdown(!showDropdown);
        },
        text: <FontAwesomeIcon icon={dotsIcon} />
    }];

    var color = getClassCode(props.mode, props.isDarkTheme)

    const darkTheme = getClassCode("", props.isDarkTheme)

    let title = "Dashboard";

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

    useTitle(setTitleForBrowser(title));

    let authToken = sessionStorage.getItem('Auth Token');

    if (!authToken) {
        return (<Navigate to="/" />)
    }

    return (
        <div className={color + "-view full-screen"}>
            <div className={"title-bar row " + color + "-color " + darkTheme + " no-select drag"}>
                {
                    // macOS overlay
                    MacTitlebarSpacing(true)
                }
                <Toggle current={props.mode} setCurrent={props.setMode} isDarkTheme={props.isDarkTheme} content={viewToggle} />

                <div className="absolute title-container">
                    <h1 className="heading title no-animation">{title}</h1>
                </div>
                <Menu 
                    className="absolute push-right top-layer"
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
                        props.switchTheme, 
                        recentsDotDropdown(props.isDarkTheme, props.switchTheme)
                    ) : null
                }
            </div>
            <div className="recent-view no-select spaced-small">{props.mode ? (<>
                <Create color={color} isDarkTheme={props.isDarkTheme} mode={props.mode} setMode={props.setMode} />
                <Projects 
                    color={color} 
                    isDarkTheme={props.isDarkTheme} 
                    mode={props.mode} 
                />
                <Files 
                    color={color} 
                    isDarkTheme={props.isDarkTheme} 
                    mode={props.mode} 
                />
            </>) : (<h1 className={"heading small " + color + "-color"}>Currently under development</h1>)}</div>
        </div>
    )
}

export default Home;