import React, {useState} from 'react';
import Toggle from "react-toggle";
import "react-toggle/style.css";

import {useTitle, getClassCode} from '../App';

import Recent from './Recent';
// @ts-ignore
import NewProject from './NewProject';

const Home = (props: { isDarkTheme: boolean; switchTheme: (arg0: boolean) => void; }) => {
	const [typeValue, setTypeValue] = useState("screenplay");

    var color = getClassCode(typeValue, props.isDarkTheme)

    const darkTheme = getClassCode("", props.isDarkTheme)

    let title = "WriterStudio";

    useTitle(title);

    return (
        <div className={ color + "-view full-screen"}>
            <div className={"title-bar " + color + "-color " + darkTheme + " no-select drag"}>
                <Toggle
                    className="dark-mode-toggle absolute push-right push-up-medium"
                    checked={props.isDarkTheme}
                    onChange={({ target }) => props.switchTheme(target.checked)}
                    icons={{ checked: "🌙", unchecked: "🔥" }}
                    aria-label="Dark mode toggle"
                />
                <h1 className="heading title no-animation">{title}</h1>
            </div>
            <div className="no-select spaced-small">
                <NewProject color={color} isDarkTheme={props.isDarkTheme} changeColor={(typeValue: string) => setTypeValue(typeValue)} />
                <Recent color={color} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default Home;