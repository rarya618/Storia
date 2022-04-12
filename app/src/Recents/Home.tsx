import React, {Dispatch, useState} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEllipsisH as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, MacTitlebarSpacing} from '../App';

import Recent from './Recent';
import NewProject from './NewProject';
import { setTitleForBrowser } from '../resources/title';
import { ButtonObject } from '../WriterView/Page';
import { recentsDotDropdown } from '../resources/dropdowns';
import { DropdownGen } from '../objects/Dropdown';
import Menu from '../WriterView/Menu';
import Toggle, { ToggleItem } from '../objects/Toggle';

type Props = { 
    isDarkTheme: boolean; 
    mode: string;
    setMode: (e: string) => void; 
    switchTheme: (arg0: boolean) => void; 
}

const Home = (props: Props) => {
    const [showDropdown, setShowDropdown] = useState(false);
    console.log(props.mode);

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
            color: "rgba(150, 199, 193, 1)"
        },
        {
            id: "ideate",
            display: "Ideating", 
            color: "rgba(97, 102, 179, 0.8)"
        }
    ]

    useTitle(setTitleForBrowser(title));

    return (
        <div className={color + "-view full-screen"}>
            <div className={"title-bar row " + color + "-color " + darkTheme + " no-select drag"}>
                {/* For macOS build only */}
                {MacTitlebarSpacing(true)}
                <Toggle mode={props.mode} setMode={props.setMode} isDarkTheme={props.isDarkTheme} content={viewToggle} />

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
                <NewProject color={color} isDarkTheme={props.isDarkTheme} changeColor={() => props.setMode(props.mode)} />
                <Recent color={color} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default Home;