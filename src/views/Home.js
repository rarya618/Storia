import {useState} from 'react';
import Toggle from "react-toggle";
import "react-toggle/style.css"

import {useTitle, getClassCode} from '../App';

import Recent from '../components/Recent';
import NewProject from '../components/NewProject';

const Home = props => {
	const [color, setColor] = useState("green");

    const darkTheme = getClassCode("", props.isDarkTheme)

    useTitle("Recents")

    return (
        <div className={ color + "-view full-screen"}>
            <div className="title-bar no-select drag transparent">
                <Toggle
                    className="dark-mode-toggle absolute push-right push-up"
                    checked={props.isDarkTheme}
                    onChange={({ target }) => props.switchTheme(target.checked)}
                    icons={{ checked: "🌙", unchecked: "🔆" }}
                    aria-label="Dark mode toggle"
                />
            </div>
            <div className="no-select spaced-small">
                <NewProject color={color} isDarkTheme={props.isDarkTheme} changeColor={(color) => setColor(color)} />
                <Recent color={color} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default Home;