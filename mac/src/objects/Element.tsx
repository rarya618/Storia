import React, {useState, useRef, useEffect, useCallback, Dispatch, ChangeEvent, KeyboardEvent} from 'react';
import ContentEditable from 'react-contenteditable';
import autosize from 'autosize';

// @ts-ignore
import {getClassCode} from "../App";

// @ts-ignore
import { allElements, autocapitalize, ElementObject } from "../views/WriterView";

// declare types
export type KeyObject = {id: string, ref: HTMLTextAreaElement | null};

// declare handlers
type ElementHandler = ({id, data, type}: ElementObject) => void;

// declare key handlers
type ElementKeyHandler = ({id, ref}: KeyObject) => void;
type ElementKeyHandlerWithType = ({id, ref}: KeyObject, type: string) => void;

// declare props
type Props = {
    id: string,
    type: string,
    data: string,
    isDarkTheme: boolean,
    updatePage: ElementHandler,
    addElement: ElementKeyHandlerWithType,
    prevElement: ElementKeyHandler,
    nextElement: ElementKeyHandler,
    deleteElement: ElementKeyHandler,
    setCurrentType: Dispatch<string>
};

function getElementName(type: string): string {
    var name: string = "";
    allElements.map((element: {code: string, display: string}) => {
        if (element.code === type) {
            name = element.display;
        }
    })

    return name;
}

// create Element object
const Element = (props: Props) => {
    const [elementType, setElementType] = useState(props.type);
    const [elementData, setElementData] = useState(props.data);
    const [previousKey, setPreviousKey] = useState("");

    const onKeyDownHandler = (e: KeyboardEvent): void => {
        logKeyStroke(e);
    }

    const onChangeHandler = (e: ChangeEvent): void => {
        setElementData(autocapitalize(
            (e.target as HTMLTextAreaElement).value, 
            elementType === 'heading' || elementType === 'transition' || elementType === 'character')
        );
    }

    const contentRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        console.log(props.id);
        console.log(elementType);
        console.log(elementData);

        if (contentRef.current) {
            // focus on current
            contentRef.current.focus();

            // autosize when height increases
            autosize(contentRef.current);
        }
    }, []);

    useEffect(() => {
        const dataChanged = props.data !== elementData;
        const typeChanged = props.type !== elementType;

        if (dataChanged || typeChanged) {
            // auto-create scene heading
            if (elementData.toLowerCase() === "int." || elementData.toLowerCase() === "ext.") {
                setElementType("heading");
            }

            // auto-create parenthetical
            else if (elementType === "dialogue" && elementData === "(") {
                setElementType("parenthetical");
                let tempData = elementData + ')';
                setElementData(tempData);
            }

            // update state with current data
            props.updatePage({
                id: props.id,
                data: elementData,
                type: elementType
            });
        }
    })

    // creates new element
    function createNewElement(type: string) {
        props.addElement({
            id: props.id,
            ref: contentRef.current
        }, type);
    }

    // change focus of caret
    function changeFocus(e: KeyboardEvent, arrowFunction: ElementKeyHandler) {
        if (!["Shift", "Meta"].includes(previousKey) ) {
            e.preventDefault();
            arrowFunction({
                id: props.id,
                ref: contentRef.current
            });
        }
    }
    
    function logKeyStroke(e: KeyboardEvent) {
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

            // if element is parenthetical
            else if (elementType === "parenthetical") {
                setElementType("dialogue")
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
            changeFocus(e, props.prevElement);
        }

        if (key === "ArrowDown") {
            // if (!["Shift", "Meta", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(previousKey) ) {
            changeFocus(e, props.nextElement);
        }

        if (key === "Enter") {
            if (previousKey !== "Shift") {
                e.preventDefault();
                // if element is character
                if (elementType === "character") {
                    if (!elementData) {
                        setElementType("action");
                    } else {
                        createNewElement("dialogue");
                    }
                }
                
                // if element is dialogue
                else if (elementType === "dialogue") {
                    createNewElement("character");
                }

                // if element is parenthetical
                else if (elementType === "parenthetical") {
                    createNewElement("dialogue");
                }

                // if element is transition
                else if (elementType === "transition") {
                    if (!elementData) {
                        setElementType("heading");
                    } else {
                        createNewElement("heading");
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
                    createNewElement("action");
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
        <textarea 
            ref={contentRef}
            className={"element no-animation " + getClassCode("", !props.isDarkTheme) + "-color " + elementType}
            value={elementData}
            placeholder={getElementName(elementType) + " here..."}
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
        />
    )
}

export default Element;