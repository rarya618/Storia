import {useState, useRef, useEffect, useCallback} from 'react';
import ContentEditable from 'react-contenteditable';
import {getClassCode} from "../../App";
import { allElements } from "../../views/WriterView";

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
        setElementType(props.type);
        setElementData(props.data);
        contentRef.current.focus();
    }, []);

    useEffect(() => {
        const dataChanged = props.data !== elementData;
        const typeChanged = props.type !== elementType;

        if (dataChanged || typeChanged) {
            props.updatePage({
                id: props.id,
                data: elementData,
                type: elementType
            });
        }
    })
    
    function logKeyStroke(e) {
        const key = e.key;
        if (key === "/") {
            setElementBackup(elementType);
        }
        if (key === "ArrowUp") {
            e.preventDefault();
            props.prevElement({
                id: props.id,
                ref: contentRef.current
            });
        }
        if (key === "ArrowDown") {
            e.preventDefault();
            props.nextElement({
                id: props.id,
                ref: contentRef.current
            });
        }
        if (key === "Enter") {
            e.preventDefault();
            props.addElement({
                id: props.id,
                ref: contentRef.current
            });
        }
        if (key === "Backspace" && !elementData) {
            e.preventDefault();
            props.deleteElement( {
                id: props.id,
                ref: contentRef.current
            });
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
        <input 
            ref={contentRef}
            className={"element " + getClassCode("", !props.isDarkTheme) + "-color " + elementType}
            value={elementData}
            placeholder="Start writing here..."
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
        />
    )
}

export default Element;