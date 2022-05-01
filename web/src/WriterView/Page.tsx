import { useParams } from "react-router-dom";
import React, {useState, useEffect} from 'react';

// import fs from "fs";
// import xml2js from "xml2js";

import { useTitle, getClassCode, capitalize } from "../App";
import Sidebar from "./Sidebar";

import Menu from "../objects/Menu";
import Script, {uid} from "./Script";
import TitleBar from "./TitleBar";
import BottomBar from "./BottomBar";
import { setTitleForBrowser } from "../resources/title";

export type ElementObject = {
    id: string;
    data: string;
    type: string;
}

export const wordCount = () => {
    var count = 0;

    return count.toString() + " words";
}

// automatically capitalises every sentence
export function autocapitalize(string: string, _allCaps: boolean = false): string {
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
export function timer(): string {
    return "0:00";
}

// all elements
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

export const getElementName = (code: string) => {
    var elementName = "";
    for (const element of allElements) {
        if (element.code === code) {
            elementName = element.display;
        }
    }

    return elementName;
}

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
    let { documentId } = useParams<string>();

    // set page color scheme
    const color = getClassCode("write", props.isDarkTheme);

    // create page title
    let title = documentId + "";

    // set title
    useTitle(setTitleForBrowser(title));

    return (
        <div className={"full-screen row"}>
            <Sidebar elements={elements} setElements={setElements} color={color} hide={hideSidebar} />
            
            <div className={"main-view fill-space " + getClassCode("", props.isDarkTheme)}>
                <TitleBar 
                    title={title}
                    status={connectionStatus}
                    setStatus={setConnectionStatus}
                    color={color}
                    isDarkTheme={props.isDarkTheme}
                    hideSidebar={hideSidebar}
                    setHideSidebar={setHideSidebar}
                    switchTheme={props.switchTheme}
                />

                <div className={"page-view"}>
                    <Script
                        currentElementType={currentElementType}
                        setCurrentType={setCurrentElementType}
                        elements={elements} 
                        setElements={(e: ElementObject[]) => setElements(e)} 
                        isDarkTheme={props.isDarkTheme}
                    />
                </div>

                <BottomBar 
                    color={color}
                    isDarkTheme={props.isDarkTheme}
                    currentElementType={currentElementType}
                    setCurrentElementType={setCurrentElementType}
                    switchTheme={props.switchTheme}
                />
            </div>
        </div>
    )
}

export default WriterView;