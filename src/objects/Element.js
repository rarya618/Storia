import {useState, useRef, useEffect, useCallback} from 'react';
import ContentEditable from 'react-contenteditable';
import autosize from 'autosize';

import {getClassCode} from "../App";
import { allElements } from "../views/WriterView";

const Element = props => {
    const [elementBackup, setElementBackup] = useState(null);
    const [elementType, setElementType] = useState("general");
    const [elementData, setElementData] = useState("");
    const [previousKey, setPreviousKey] = useState("");

    const onKeyDownHandler = (e) => {
        logKeyStroke(e);
    }

    const onChangeHandler = (e) => {
        setElementData(e.target.value);
    }

    const contentRef = useRef(null);

    useEffect(() => {
        // set type and data
        setElementType(props.type);
        setElementData(props.data);

        // focus on current
        contentRef.current.focus();

        // autosize when height increases
        autosize(contentRef.current);
    }, []);

    useEffect(() => {
        const dataChanged = props.data !== elementData;
        const typeChanged = props.type !== elementType;

        if (dataChanged || typeChanged) {
            // check for scene heading
            if (elementData.toLowerCase() == "int." || elementData.toLowerCase() == "ext.") {
                setElementType("heading");
            }

            props.updatePage({
                id: props.id,
                data: elementData,
                type: elementType
            });
        }
    })

    // handles Enter key press
    function handleEnterKey(event, type) {
        event.preventDefault();
        props.addElement({
            id: props.id,
            ref: contentRef.current
        }, type);
    }
    
    function logKeyStroke(e) {
        const key = e.key;

        if (key === "Tab") {
            e.preventDefault();

            // if element is character
            if (elementType === "character") {
                setElementType("transition")
            }
            
            // if element is dialogue
            else if (elementType === "dialogue") {
                setElementType("parenthetical")
                let tempData = '(' + elementData + ')';
                setElementData(tempData);
            }

            // if element is transition
            else if (elementType === "transition") {
                setElementType("action")
            }

            // all other cases
            else {
                setElementType("character")
            }
        }

        if (key === "ArrowUp") {
            if (!["Shift", "Meta", "ArrowLeft", "ArrowRight", "ArrowDown"].includes(previousKey) ) {
                e.preventDefault();
                props.prevElement({
                    id: props.id,
                    ref: contentRef.current
                });
            }
        }

        if (key === "ArrowDown") {
            if (!["Shift", "Meta", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(previousKey) ) {
                e.preventDefault();
                props.nextElement({
                    id: props.id,
                    ref: contentRef.current
                });
            }
        }
        if (key === "Enter") {
            if (previousKey !== "Shift") {
                // if element is character
                if (elementType === "character") {
                    handleEnterKey(e, "dialogue");
                }
                
                // if element is dialogue
                else if (elementType === "dialogue") {
                    handleEnterKey(e, "character");
                }

                // if element is parenthetical
                else if (elementType === "parenthetical") {
                    handleEnterKey(e, "dialogue");
                }

                // if element is transition
                else if (elementType === "transition") {
                    handleEnterKey(e, "heading")
                }

                // all other cases
                else {
                    handleEnterKey(e, "action")
                }
            }
        }
        if (key === "Backspace" && !elementData) {
            if (elementType === "character") {
                setElementType("action");
            } 
            
            else if (elementType === "parenthetical") {
                setElementType("dialogue");
            }
            
            else if (elementType === "transition") {
                setElementType("character");
            }

            else {
                e.preventDefault();
                props.deleteElement( {
                    id: props.id,
                    ref: contentRef.current
                });
            }
        }
        
        setPreviousKey(key);
    }

    return (
        // <ContentEditable 
        //     innerRef={contentRef}
        //     className={"element " + elementType}
        //     tagName="div"
        //     html={elementData}
        //     onChange={onChangeHandler}
        //     onKeyDown={onKeyDownHandler}
        // />
        <textarea 
            ref={contentRef}
            className={"element no-animation " + getClassCode("", !props.isDarkTheme) + "-color " + elementType}
            value={elementData}
            placeholder="Start writing here..."
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
        />
    )
}

export default Element;