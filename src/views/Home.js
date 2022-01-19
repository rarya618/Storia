import {useState} from 'react';

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
                <button onClick={props.switchTheme} className={"label small " + color +  " solid " + color + "-border " + darkTheme + "-color absolute push-right push-up round-10px none-spaced-none"}>Dark Mode</button>
            </div>
            <div className="no-select spaced-small">
                <NewProject color={color} isDarkTheme={props.isDarkTheme} changeColor={(color) => setColor(color)} />
                <Recent color={color} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default Home;