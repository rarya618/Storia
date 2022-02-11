const Button = props => {
    return (
        <button 
            className={"button relative-button medium " +
            props.color + "-color " + 
            props.color + "-view " + 
            props.border + "-border round-5px small-spaced no-select"}
            onClick={props.onClick}
            id={props.id}
        >
            {props.text}
        </button>
    )
}

export default Button;