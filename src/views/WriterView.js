import { Link, useParams } from "react-router-dom";
import {useState} from 'react';
import Toggle from "react-toggle";
import "react-toggle/style.css";

import Button from "../components/objects/Button";
import ElementsDropdown from "../components/objects/ElementsDropdown";
import { useTitle, getClassCode } from "../App";
import Sidebar from "../components/Sidebar";

function counter(documentType) {
    var count = 0;
    var text = "words"

    if (documentType === "series") {
        text = "scripts";
    }

    return count.toString() + " " + text;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function timer() {
    return "0:00 / 0:00";
}

const WriterView = props => {
    const [border, setBorder] = useState(false);
    const [hideSidebar, setHideSidebar] = useState(true);

    let { documentType, documentId, documentName } = useParams();

    const color = getClassCode(documentType, props.isDarkTheme);

    useTitle(documentName + " - " + capitalize(documentType))

    function borderValue() {
        if (border) {
            return color;
        } else {
            return "no";
        }
    }

    return (
        <div className={"full-screen row"}>
            <Sidebar color={color} hide={hideSidebar} />
            <div className={"main-view fill-space " + color + "-view"}>
                <div className={"title-bar no-select drag white " + color + "-color"}>
                    <Toggle
                        className={"dark-mode-toggle absolute push-right push-up"}
                        checked={props.isDarkTheme}
                        onChange={({ target }) => props.switchTheme(target.checked)}
                        icons={{ checked: "🌙", unchecked: "🔆" }}
                        aria-label="Dark mode toggle"
                    />
                    <h1 className="heading title">{documentName} - {counter(documentType)}, {timer()}</h1>
                </div>
                <div className={"menu " + getClassCode("", props.isDarkTheme)}>
                    <Link to="/">
                        <Button text="Home" color={color} border={borderValue()} />
                    </Link>
                    <Button onClick={(e) => {
                        e.preventDefault();
                        setHideSidebar(!hideSidebar);
                    }} text="&#8647;" color={color} border={borderValue()} />
                    <Button text="&#8617;" color={color} border={borderValue()} />
                    <Button text="&#8618;" color={color} border={borderValue()} />
                    <ElementsDropdown text="Element" color={color} border={borderValue()} />
                    <Button text={<strong>B</strong>} color={color} border={borderValue()} />
                    <Button text={<i>I</i>} color={color} border={borderValue()} />
                    <Button text={<u>U</u>} color={color} border={borderValue()} />
                    <Button text="Find" color={color} border={borderValue()} />
                    <Button text="Comment" color={color} border={borderValue()} />
                </div>
                <div className="container">
                </div>
            </div>
        </div>
    )
}

export default WriterView;