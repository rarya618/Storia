import { Link } from "react-router-dom";

const buttonStyle = "px-6 py-1.5 rounded std-shadow hover:shadow pointer transition-shadow select-none text-sm ";
const purpleButtonStyle = "bg-purple text-white dark:text-neutral-900 " + buttonStyle; 
const whiteButtonStyle = "bg-white text-purple dark:bg-neutral-800 " + buttonStyle;

type ButtonProps = {
    text: string, 
    link?: string, 
    onClick?: () => void
};

const PurpleButton = ({text, link, onClick}: ButtonProps) => {
    let buttonStyle = purpleButtonStyle;
    
    if (link)
        return (<Link to={link}>
            <button className={buttonStyle} onClick={onClick}>{text}</button>
        </Link>)
    return (
        <button className={buttonStyle} onClick={onClick}>{text}</button>
    )
}

const WhiteButton = ({text, link, onClick}: ButtonProps) => {
    let buttonStyle = whiteButtonStyle;
    
    if (link)
        return (<Link to={link}>
            <button className={buttonStyle} onClick={onClick}>{text}</button>
        </Link>)
    return (
        <button className={buttonStyle} onClick={onClick}>{text}</button>
    )
}

export {PurpleButton, WhiteButton}