import React, {useState} from 'react';
import Toggle from "react-toggle";
import "react-toggle/style.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, switchTheme} from '../App';

import Recent from './Recent';
import NewProject from './NewProject';
import { setTitleForBrowser } from '../resources/title';
import { ButtonObject } from '../WriterView/Page';
import { recentsDotDropdown } from '../resources/dropdowns';
import { DropdownGen } from '../objects/Dropdown';
import Menu from '../WriterView/Menu';

const Home = (props: { isDarkTheme: boolean; switchTheme: (arg0: boolean) => void; }) => {
	const [typeValue, setTypeValue] = useState("screenplay");
    const [showDropdown, setShowDropdown] = useState(false);

    const rightMenu: ButtonObject[] = [
        {
            id: "dots",
            onClick: (e: Event) => {
                e.preventDefault();
                setShowDropdown(!showDropdown);
            },
            text: <FontAwesomeIcon icon={dotsIcon} />
        }
    ];

    var color = getClassCode(typeValue, props.isDarkTheme)

    const darkTheme = getClassCode("", props.isDarkTheme)

    let title = "Dashboard";

    useTitle(setTitleForBrowser(title));

    return (
        <div className={ color + "-view full-screen"}>
            <div className={"title-bar " + color + "-color " + darkTheme + " no-select drag"}>
                {/* <Toggle
                    className="dark-mode-toggle absolute push-right push-up-medium"
                    checked={props.isDarkTheme}
                    onChange={({ target }) => props.switchTheme(target.checked)}
                    icons={{ checked: "🌙", unchecked: "🔥" }}
                    aria-label="Dark mode toggle"
                /> */}
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
                {showDropdown ? DropdownGen(color, props.isDarkTheme, props.switchTheme, recentsDotDropdown(props.isDarkTheme, props.switchTheme)) : null}
            </div>
            <div className="no-select spaced-small">
                <NewProject color={color} isDarkTheme={props.isDarkTheme} changeColor={(typeValue: string) => setTypeValue(typeValue)} />
                <Recent color={color} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default Home;