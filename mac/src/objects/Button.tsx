import React, { MouseEventHandler } from "react";

type Props = {
    onClick: MouseEventHandler,
    text: string,
    color: string,
    border: string,
    id: string
}

const Button = ({color, onClick, text, border, id}: Props) => {
    return (
        <button 
            className={"button relative-button medium " 
            + color + "-color " 
            + color + "-view " 
            + border + "-border round-5px small-spaced no-select"} 
            onClick={onClick} 
            id={id}>
            {text}
        </button>
    )
}

export default Button;