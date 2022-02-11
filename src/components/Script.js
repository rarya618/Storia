import {getClassCode} from "../App";
import {useState, useEffect} from 'react';
import Element from "../objects/Element";
import ContentEditable from 'react-contenteditable';

// unique id generator
export const uid = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const setCaretToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
};

const matchCaretLocation = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
};


// script component
const Script = ({elements, setElements, isDarkTheme}) => {
    // update page
    function updatePageHandler(updatedElement) {
        const index = elements.map((b) => b.id).indexOf(updatedElement.id);
        const updatedElements = [...elements];
        updatedElements[index] = {
            ...updatedElements[index],
            type: updatedElement.type,
            data: updatedElement.data
        };
        setElements(updatedElements);
    }

    // add element
    function addElementHandler(currentElement) {
        const newElement = { id: uid(), data: "", type: "general" };
        const index = elements.map((b) => b.id).indexOf(currentElement.id);
        const updatedElements = [...elements];
        updatedElements.splice(index + 1, 0, newElement);
        setElements(updatedElements);
    }

    // previous element
    function prevElementHandler(currentElement) {
        const prevElement = currentElement.ref.previousElementSibling;
        if (prevElement) {
            prevElement.focus();
            // setCaretToEnd(prevElement);
        }
    }

    // next element
    function nextElementHandler(currentElement) {
        const nextElement = currentElement.ref.nextElementSibling;
        if (nextElement) {
            nextElement.focus();
            // setCaretToEnd(nextElement);
        }
    }

    // delete elememt
    function deleteElementHandler(currentElement) {
        const previousBlock = currentElement.ref.previousElementSibling;
        
        if (previousBlock) {
            const index = elements.map((b) => b.id).indexOf(currentElement.id);
            const updatedElements = [...elements];
            updatedElements.splice(index, 1);
            setElements(updatedElements);
            setCaretToEnd(previousBlock);
            previousBlock.focus();
        }
    }

    return (
        <div className={"script-container " + getClassCode("", !isDarkTheme) + "-color no-animation"}>
            <div className="script-view no-animation">
                <div className="content" spellCheck="true" translate="no">
                    {elements.map((element, key) => {
                        return (
                            <Element 
                                key={key} 
                                id={element.id}
                                type={element.type}
                                data={element.data}
                                isDarkTheme={isDarkTheme}
                                updatePage={updatePageHandler}
                                addElement={addElementHandler}
                                prevElement={prevElementHandler}
                                nextElement={nextElementHandler}
                                deleteElement={deleteElementHandler}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Script;