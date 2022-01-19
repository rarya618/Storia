import {useState} from 'react';
import Toggle from "react-toggle";
import "react-toggle/style.css";

import {useTitle, getClassCode} from '../App';

import Recent from '../components/Recent';
import NewProject from '../components/NewProject';

const Home = props => {
	const [color, setColor] = useState("green");

    const darkTheme = getClassCode("", props.isDarkTheme)

    useTitle("New Document - Script Writer Studio")

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
                <h1 className="heading title no-animation">New Document - Script Writer Studio</h1>
            </div>
            <div className="no-select spaced-small">
                <NewProject color={color} isDarkTheme={props.isDarkTheme} changeColor={(color) => setColor(color)} />
                <Recent color={color} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default Home;