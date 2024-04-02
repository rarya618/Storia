import { Link } from "react-router-dom";

const buttonStyle = "px-6 py-1.5 rounded std-shadow hover:shadow pointer transition-shadow";
const purpleButtonStyle = "bg-purple text-white dark:text-neutral-900 " + buttonStyle; 
const whiteButtonStyle = "bg-white text-purple dark:bg-neutral-800 " + buttonStyle;

const PurpleButton = (text: string, link?: string) => {
    if (link)
        return (<Link to={link}>
            <button className={purpleButtonStyle}>{text}</button>
        </Link>)
    return (
        <button className={purpleButtonStyle}>{text}</button>
    )
}

const WhiteButton = (text: string, link?: string) => {
    if (link)
        return (<Link to={link}>
            <button className={whiteButtonStyle}>{text}</button>
        </Link>)
    return (
        <button className={whiteButtonStyle}>{text}</button>
    )
}

export {PurpleButton, WhiteButton}