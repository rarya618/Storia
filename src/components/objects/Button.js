import {useState} from 'react';

const Button = props => {
    const [border, setBorder] = useState("no");
    
    return (
        <button 
            className={"button " +
            props.color + "-color " + 
            props.color + "-view " + 
            border + "-border round-5px small-spaced"}
        >
            {props.text}
        </button>
    )
}

export default Button;