import { useParams } from "react-router-dom";
import {useState, useEffect} from 'react';

import Toggle from "react-toggle";
import "react-toggle/style.css";

// import fs from "fs";
// import xml2js from "xml2js";

import { useTitle, getClassCode } from "../App";
import Sidebar from "../components/Sidebar";
import Menu from "../components/Menu";
import Script from "../components/Script";

import sampleFile from "../sample/sample-2.sws";

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

const WriterView = props => {
    const [hideSidebar, setHideSidebar] = useState(true);

    // get details from params
    let { documentType, documentId, documentName } = useParams();

    // set page color scheme
    const color = getClassCode(documentType, props.isDarkTheme);

    var fileContents = GetFileData(sampleFile);

    // create page title
    useTitle(documentName + " - " + capitalize(documentType));

    return (
        <div className={"full-screen row"}>
            <Sidebar color={color} hide={hideSidebar} />
            
            <div className={"main-view fill-space " + getClassCode("", props.isDarkTheme)}>
                <div className={"title-bar title-bar-with-menu no-select drag " + color + "-color " + getClassCode("", props.isDarkTheme)}>
                    <Toggle
                        className={"dark-mode-toggle absolute push-right push-up-medium"}
                        checked={props.isDarkTheme}
                        onChange={({ target }) => props.switchTheme(target.checked)}
                        icons={{ checked: "🌙", unchecked: "🔥" }}
                        aria-label="Dark mode toggle"
                    />
                    <h1 className="heading title">{documentName} - Sync Failed {/*- {counter(documentType)}, {timer()}*/}</h1>
                    <Menu isDarkTheme={props.isDarkTheme} 
                    color={color} hideSidebar={(e) => {
                        e.preventDefault();
                        setHideSidebar(!hideSidebar);
                    }} />
                </div>
                
                <Script fileContents = {fileContents} isDarkTheme={props.isDarkTheme} />
            </div>
        </div>
    )
}

export default WriterView;