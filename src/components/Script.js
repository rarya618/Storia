import {getClassCode} from "../App";

function createScript(rawScript) {
    var scriptArray = rawScript.split('\\');

    return scriptArray.map(scriptObject => {
        var splitScriptObject = scriptObject.split(' ');

        if (splitScriptObject[0][0] === '&') {
            var line = splitScriptObject.slice(1).join(' ');
            return <div className={splitScriptObject[0].slice(1)}>{line}</div>
        }
    })

    // element.addEventListener("keyup", (e) => {
    //     if (e.key === "Enter") {
    //         element.innerHTML += "<div class='general'>Enter some text</div>";
    //     }
    // })
}

const Script = ({fileContents, isDarkTheme}) => {
    // var element = document.getElementById("script");

    return (
        <div className={"script-container " + getClassCode("", !isDarkTheme) + "-color no-animation"}>
            <div spellCheck="true" translate="no" contentEditable="true" className="script-view no-animation">
                {createScript(fileContents)}
            </div>
        </div>
    )
}

export default Script;