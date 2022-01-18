import {useState} from 'react';

import Recent from '../components/Recent';
import NewProject from '../components/NewProject';

function Home() {
	const [color, setColor] = useState("green");

    return (
        <div className={ color + "-view full-screen"}>
            <div className="title-bar no-select drag transparent">
            </div>
            <div className="no-select spaced-small">
                <NewProject color={color} changeColor={(color) => setColor(color)} />
                <Recent color={color} />
            </div>
        </div>
    )
}

export default Home;