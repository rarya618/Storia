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
const Script = ({elements, setElements, isDarkTheme, currentElementType, setCurrentType}) => {
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
        setCurrentType(updatedElement.type);
    }

    // add element
    function addElementHandler(currentElement, elementType) {
        const newElement = { id: uid(), data: "", type: elementType };
        const index = elements.map((b) => b.id).indexOf(currentElement.id);
        // console.log(index);
        const updatedElements = [...elements];
        updatedElements.splice(index + 1, 0, newElement);
        // console.log(updatedElements);
        setElements(updatedElements);
        setCurrentType(newElement.type);
        // currentElement.ref.nextElementSibling.focus();
        // console.log("From AddElement: ", elements);
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

    // current element
    function currentElementHandler(currentElement) {}

    return (
        <div className={"script-container " + getClassCode("", !isDarkTheme) + "-color no-animation"}>
            <div className="script-view no-animation">
                <div className="content">
                    {/* {console.log("From Script: ", elements)} */}
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
                                setCurrentType={setCurrentType}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Script;