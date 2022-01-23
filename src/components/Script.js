import {getClassCode} from "../App";
import {useState} from 'react';
import Element from "./objects/Element";

function createScript(rawScript) {
    var scriptArray = rawScript.split('\\');

    return scriptArray.map(scriptObject => {
        var splitScriptObject = scriptObject.split(' ');

        if (splitScriptObject[0][0] === '&') {
            var line = splitScriptObject.slice(1).join(' ');
            return <Element className={splitScriptObject[0].slice(1)} data={line} />
        }
    })
}

function keyStroke() {
    var element = document.getElementById("script");
    element.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            element.innerHTML += "<span class='general'>Enter some text</div>";
        }
    })
}

const Script = ({fileContents, isDarkTheme}) => {
    return (
        <div className={"script-container " + getClassCode("", !isDarkTheme) + "-color no-animation"}>
            <div className="script-view no-animation">
                <div className="content" spellCheck="true" translate="no" contentEditable>
                    {createScript(fileContents)}
                </div>
            </div>
        </div>
    )
}

export default Script;