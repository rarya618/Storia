import {useState, useRef, useEffect, useCallback} from 'react';
import ContentEditable from 'react-contenteditable';
import autosize from 'autosize';

import {getClassCode} from "../App";
import { allElements } from "../views/WriterView";

const Element = props => {
    const [elementType, setElementType] = useState(props.type);
    const [elementData, setElementData] = useState(props.data);
    const [previousKey, setPreviousKey] = useState("");

    const onKeyDownHandler = (e) => {
        logKeyStroke(e);
    }

    const onChangeHandler = (e) => {
        setElementData(e.target.value);
    }

    const contentRef = useRef(null);

    useEffect(() => {
        // console.log(props.id);
        // console.log(elementType);
        // console.log(elementData);

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
    function handleEnterKey(type) {
        props.addElement({
            id: props.id,
            ref: contentRef.current
        }, type);
    }

    function handleArrowKey(e, arrowFunction) {
        if (!["Shift", "Meta"].includes(previousKey) ) {
            e.preventDefault();
            arrowFunction({
                id: props.id,
                ref: contentRef.current
            });
        }
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
            // if (!["Shift", "Meta", "ArrowLeft", "ArrowRight", "ArrowDown"].includes(previousKey) ) {
            handleArrowKey(e, props.prevElement);
        }

        if (key === "ArrowDown") {
            // if (!["Shift", "Meta", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(previousKey) ) {
            handleArrowKey(e, props.nextElement);
        }

        if (key === "Enter") {
            if (previousKey !== "Shift") {
                e.preventDefault();
                // if element is character
                if (elementType === "character") {
                    if (!elementData) {
                        setElementType("action");
                    } else {
                        handleEnterKey("dialogue");
                    }
                }
                
                // if element is dialogue
                else if (elementType === "dialogue") {
                    handleEnterKey("character");
                }

                // if element is parenthetical
                else if (elementType === "parenthetical") {
                    handleEnterKey("dialogue");
                }

                // if element is transition
                else if (elementType === "transition") {
                    if (!elementData) {
                        setElementType("heading");
                    } else {
                        handleEnterKey("heading");
                    }
                }

                // if element is action with no content
                else if (elementType === "action" && !elementData) {
                    setElementType("heading");
                }

                // if element is heading with no content
                else if (elementType === "heading" && !elementData) {
                    setElementType("action");
                }

                // all other cases
                else {
                    handleEnterKey("action");
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