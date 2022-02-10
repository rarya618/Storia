import { allElements } from "../../views/WriterView";

const ElementsDropdown = props => {
    return (
        <select
            className={"button relative-button dropdown small " +
            props.color + "-color " + 
            props.color + "-view " + 
            props.border + "-border round-5px small-spaced no-select"}
        >
            {allElements.map((element, index) => {
                return <option key={index} value={element.code}>{element.display}</option>
            })}
        </select>
    )
}

export default ElementsDropdown;