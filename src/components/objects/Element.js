import {useState, useRef, useEffect, useCallback} from 'react';
import ContentEditable from 'react-contenteditable';

const Element = props => {
    const [elementBackup, setElementBackup] = useState(null);
    const [elementType, setElementType] = useState("general");
    const [elementData, setElementData] = useState("");
    const [previousKey, setPreviousKey] = useState("");

    const onChangeHandler = useCallback((e) => {
        setElementData(e.target.value)
    })

    const contentRef = useRef(null);

    useEffect(() => {
        setElementType(props.type);
        setElementData(props.data);
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

    function keyStroke(e) {
        if (e.key === "/") {
            setElementBackup(elementType);
        }
        if (e.key === "Enter") {
            if (previousKey !== "Shift") {
                e.preventDefault();
                props.addElement({
                    id: props.id,
                    ref: contentRef.current
                });
            }
        }
        if (e.key === "Backspace" && !elementData) {
            e.preventDefault();
            props.deleteElement( {
                id: props.id,
                ref: contentRef.current
            });
        }
        setPreviousKey(e.key);
    }

    return (
        <ContentEditable 
            innerRef={contentRef}
            className={"element " + elementType}
            tagName="div"
            html={elementData}
            onChange={onChangeHandler}
            onKeyDown={keyStroke}
        />
    )
}

export default Element;