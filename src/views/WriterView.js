import { useParams } from "react-router-dom";
import {useState} from 'react';

import Toggle from "react-toggle";
import "react-toggle/style.css";

// import fs from "fs";
// import xml2js from "xml2js";

import { useTitle, getClassCode } from "../App";
import Sidebar from "../components/Sidebar";
import Menu from "../components/Menu";

import sampleFile from "../sample/kdefsd.swsx";

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

async function fileData() {
    var fileData = await fetch(sampleFile)
    .then(res => res.text())
    .then(text => {
        var element = document.getElementById("script");
        element.innerHTML = text;
        return text;
    });

    return fileData
}

const WriterView = props => {
    const [hideSidebar, setHideSidebar] = useState(true);

    // get details from params
    let { documentType, documentId, documentName } = useParams();

    var fileContents = fileData();

    // set page color scheme
    const color = getClassCode(documentType, props.isDarkTheme);

    // create page title
    useTitle(documentName + " - " + capitalize(documentType));

    if (fileContents) {
        return (
            <div className={"full-screen row"}>
                <Sidebar color={color} hide={hideSidebar} />
                
                <div className={"main-view fill-space " + getClassCode("", props.isDarkTheme)}>
                    <div className={"title-bar no-select drag white " + color + "-color"}>
                        <Toggle
                            className={"dark-mode-toggle absolute push-right push-up-medium"}
                            checked={props.isDarkTheme}
                            onChange={({ target }) => props.switchTheme(target.checked)}
                            icons={{ checked: "🌙", unchecked: "🔥" }}
                            aria-label="Dark mode toggle"
                        />
                        <h1 className="heading title">{documentName} {/*- {counter(documentType)}, {timer()}*/}</h1>
                    </div>
                    
                    <Menu isDarkTheme={props.isDarkTheme} 
                        color={color} hideSidebar={(e) => {
                            e.preventDefault();
                            setHideSidebar(!hideSidebar);
                        }} />
                    
                    <div className={"script-container " + getClassCode("", !props.isDarkTheme) + "-color no-animation"}>
                        <div id="script"></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default WriterView;