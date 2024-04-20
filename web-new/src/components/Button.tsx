import { Link } from "react-router-dom";

const buttonStyle = "px-6 py-1.5 rounded std-shadow hover:shadow pointer transition-shadow select-none";
const smallButtonStyle = " text-sm"
const purpleButtonStyle = "bg-purple text-white dark:text-neutral-900 " + buttonStyle; 
const purpleSmallButtonStyle = purpleButtonStyle + smallButtonStyle; 
const whiteButtonStyle = "bg-white text-purple dark:bg-neutral-800 " + buttonStyle;
const whiteSmallButtonStyle = whiteButtonStyle + smallButtonStyle; 


const PurpleButton = (text: string, link?: string, isSmall?: boolean) => {
    let buttonStyle = isSmall ? purpleSmallButtonStyle : purpleButtonStyle;
    
    if (link)
        return (<Link to={link}>
            <button className={buttonStyle}>{text}</button>
        </Link>)
    return (
        <button className={buttonStyle}>{text}</button>
    )
}

const WhiteButton = (text: string, link?: string, isSmall?: boolean) => {
    let buttonStyle = isSmall ? whiteSmallButtonStyle : whiteButtonStyle;
    
    if (link)
        return (<Link to={link}>
            <button className={buttonStyle}>{text}</button>
        </Link>)
    return (
        <button className={buttonStyle}>{text}</button>
    )
}

export {PurpleButton, WhiteButton}