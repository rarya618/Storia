import {useState} from 'react';

import {useTitle} from '../App';

import Recent from '../components/Recent';
import NewProject from '../components/NewProject';

const Home = props => {
	const [color, setColor] = useState("green");

    useTitle("Recents")

    return (
        <div className={ color + "-view full-screen"}>
            <div className="title-bar no-select drag transparent">
            </div>
            <div className="no-select spaced-small">
                <NewProject color={color} isDarkTheme={props.isDarkTheme} changeColor={(color) => setColor(color)} />
                <Recent color={color} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default Home;