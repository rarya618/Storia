import { useParams } from "react-router-dom";
import {useState, useEffect} from 'react';

import Toggle from "react-toggle";
import "react-toggle/style.css";

// import fs from "fs";
// import xml2js from "xml2js";

import { useTitle, getClassCode } from "../App";
import Sidebar from "../components/Sidebar";
import Menu from "../components/Menu";
import Script, {uid} from "../components/Script";

import sampleFile from "../sample/sample-2.sws";

function wordCounter() {
    var count = 0;

    return count.toString() + " words";
}

export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// timer display
function timer() {
    return "0:00 / 0:00";
}

export const allElements = [
    {code: "general", display: "General"},
    {code: "heading", display: "Scene Heading"},
    {code: "action", display: "Action"},
    {code: "character", display: "Character"},
    {code: "parenthetical", display: "Parenthetical"},
    {code: "dialogue", display: "Dialogue"},
    {code: "transition", display: "Transition"},
    {code: "shot", display: "Shot"},
    {code: "character-list", display: "Scene Characters"},
    {code: "new-act", display: "New Act"},
    {code: "end-act", display: "End of Act"}
]

// file data
function GetFileData(sampleFile) {
    const [data, setData] = useState("");

    async function getFileData() {
        // Used Specific File for Testing
        var content = await fetch(sampleFile)
        .then(response => response.text())
        .then(text =>{
            setData(text);
        });
    }

    useEffect(() => {
        getFileData();
    }, [])

    return data;
}

// initial sample element
const initialElement = { id: uid(), data: "", type: "general" };

const WriterView = props => {
    // sidebar status
    const [hideSidebar, setHideSidebar] = useState(true);

    // script elements
    const [elements, setElements] = useState([initialElement]);

    // server status
    const [connectionStatus, setConnectionStatus] = useState("Offline");

    // get details from params
    let { documentType, documentId, documentName } = useParams();

    // set page color scheme
    const color = getClassCode(documentType, props.isDarkTheme);

    // create page title
    var title = documentName + " - " + connectionStatus;

    // set title
    useTitle(title);

    return (
        <div className={"full-screen row"}>
            <Sidebar elements={elements} setElements={setElements} color={color} hide={hideSidebar} />
            
            <div className={"main-view fill-space " + getClassCode("", props.isDarkTheme)}>
                <div className={"title-bar title-bar-with-menu no-select drag " + color + "-color " + getClassCode("", props.isDarkTheme)}>
                    <Toggle
                        className={"dark-mode-toggle absolute push-right push-up-medium"}
                        checked={props.isDarkTheme}
                        onChange={({ target }) => props.switchTheme(target.checked)}
                        icons={{ checked: "🌙", unchecked: "🔥" }}
                        aria-label="Dark mode toggle"
                    />
                    <h1 className="heading title no-animation">{title}</h1>
                    <Menu 
                        isDarkTheme={props.isDarkTheme} 
                        color={color} hideSidebar={(e) => {
                            e.preventDefault();
                            setHideSidebar(!hideSidebar);
                        }} 
                    />
                </div>
                
                <Script elements={elements} setElements={setElements} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default WriterView;