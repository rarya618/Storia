import React, { MouseEventHandler } from "react";

type Props = {
    onClick?: MouseEventHandler,
    text: string | JSX.Element,
    color: string,
    border?: string,
    id?: string
}

const Button = ({color, onClick, text, border, id}: Props) => {
    return (
        <button 
            className={"button medium " 
            + color + "-color no-animation " 
            + color + "-button " 
            + border + "-border round-5px small-spaced-small no-select"} 
            onClick={onClick} 
            id={id}>
            {text}
        </button>
    )
}

export default Button;