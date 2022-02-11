import { allElements } from "../views/WriterView";

const ElementsDropdown = ({color, border, currentElementType, setElementType}) => {
    return (
        <select
            className={
                "button relative-button dropdown small " +
                color + "-color " + 
                color + "-view " + 
                border + "-border round-5px small-spaced no-select"
            }
            value={currentElementType}
        >
            {allElements.map((element, index) => {
                return <option key={index} value={element.code}>{element.display}</option>
            })}
        </select>
    )
}

export default ElementsDropdown;