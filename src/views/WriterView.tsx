import { useParams } from "react-router-dom";
import React, {useState, useEffect} from 'react';

import Toggle from "react-toggle";
import "react-toggle/style.css";

// import fs from "fs";
// import xml2js from "xml2js";

import { useTitle, getClassCode } from "../App";

// @ts-ignore
import Sidebar from "../components/Sidebar";

// @ts-ignore
import Menu from "../components/Menu";

// @ts-ignore
import Script, {uid} from "../components/Script";

function wordCounter() {
    var count = 0;

    return count.toString() + " words";
}

// automatically capitalises every sentence
export function autocapitalize(string: string, _allCaps: boolean = false): string {
    // capitalise first letter of a string
    function capitalize(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    if (_allCaps) {
        return string.toUpperCase();
    } 
    
    else {
        // split string into sentences
        let splitData = string.split(". ");

        // capitalise first letter of each sentence
        splitData.map((splitDataObject, index) => {
            splitData.splice(index, 1, capitalize(splitDataObject));
        })

        let fullStopCapitalized = splitData.join(". ");

        // split string into questions
        let splitIntoQuestions = fullStopCapitalized.split("? ");

        // capitalise first letter of each question
        splitIntoQuestions.map((splitDataObject, index) => {
            splitIntoQuestions.splice(index, 1, capitalize(splitDataObject));
        })

        return splitIntoQuestions.join("? ");
    }

    
}

// timer display
function timer(): string {
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

// get file from server
function GetFileData(fileId: string) {
    // initialise file data
    const [data, setData] = useState("");

    async function getFileData() {
        // fetch file from server
        await fetch(fileId)
        .then(response => response.text())
        .then(text => {
            setData(text);
        });
    }

    // call function
    useEffect(() => {
        getFileData();
    }, [])

    return data;
}

// initial sample element
const initialElement = { id: uid(), data: "", type: "heading" };

const WriterView = (props: { isDarkTheme: boolean, switchTheme: (arg0: boolean) => void}) => {
    // sidebar status
    const [hideSidebar, setHideSidebar] = useState(true);

    // script elements
    const [elements, setElements] = useState([initialElement]);

    // current element type
    const [currentElementType, setCurrentElementType] = useState("general");

    // server status
    const [connectionStatus, setConnectionStatus] = useState("Offline");

    // get details from params
    let { documentType, documentId, documentName } = useParams<string>();

    // set page color scheme
    // @ts-ignore
    const color = getClassCode(documentType, props.isDarkTheme);

    // create page title
    let title = documentName + " – " + connectionStatus;

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
                        color={color} 
                        hideSidebar={(e: Event) => {
                            e.preventDefault();
                            setHideSidebar(!hideSidebar);
                        }}
                        currentElementType={currentElementType}
                        setCurrentType={setCurrentElementType}
                    />
                </div>
                
                <Script
                    currentElementType={currentElementType}
                    setCurrentType={setCurrentElementType}
                    elements={elements} 
                    setElements={(e: {
                        id: any;
                        data: string;
                        type: string;
                    }[]) => setElements(e)} 
                    isDarkTheme={props.isDarkTheme}
                />
            </div>
        </div>
    )
}

export default WriterView;