var options = [
    "General",
    "Scene Heading",
    "Action",
    "Character",
    "Parenthetical",
    "Dialogue",
    "Transition",
    "Shot",
    "Scene Characters",
    "New Act",
    "End of Act"
]

const ElementsDropdown = props => {
    return (
        <select
            className={"button dropdown small " +
            props.color + "-color " + 
            props.color + "-view " + 
            props.border + "-border round-5px small-spaced no-select"}
        >
            {options.map((option, index) => {
                return <option key={index} value={option}>{option}</option>
            })}
        </select>
    )
}

export default ElementsDropdown;