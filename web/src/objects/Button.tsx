import React, { MouseEventHandler } from "react";

type Props = {
    onClick?: MouseEventHandler,
    text: string | JSX.Element,
    color: string,
    border?: string,
    id?: string,
    className?: string
}

const Button = ({color, onClick, text, border, id, className}: Props) => {
    return (
        <button 
            className={"button " 
            + color + "-color no-animation " 
            + color + "-button " 
            + border + "-border round-5px small-spaced-small no-select" + (className ? " " + className : "")} 
            onClick={onClick} 
            id={id}>
            {text}
        </button>
    )
}

export default Button;