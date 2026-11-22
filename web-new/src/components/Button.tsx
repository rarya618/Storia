import { Link } from "react-router-dom";

const buttonStyle = "inline-flex items-center justify-center px-6 py-1.5 rounded shadow cursor-pointer transition select-none text-sm disabled:cursor-not-allowed disabled:opacity-60 ";
const purpleButtonStyle = "bg-purple text-white dark:text-neutral-900 hover:opacity-90 active:opacity-80 " + buttonStyle;
const whiteButtonStyle = "bg-white text-purple dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 active:bg-neutral-100 " + buttonStyle;

type ButtonProps = {
    text: string,
    link?: string,
    onClick?: () => void,
    type?: "button" | "submit",
    disabled?: boolean,
};

const makeButton = (style: string) => ({text, link, onClick, type, disabled}: ButtonProps) => {
    if (link)
        return <Link className={style} to={link} onClick={onClick}>{text}</Link>;

    // buttons with a click handler are plain buttons; the rest submit their form
    return (
        <button
            className={style}
            onClick={onClick}
            type={type ?? (onClick ? "button" : "submit")}
            disabled={disabled}
        >
            {text}
        </button>
    );
};

const PurpleButton = makeButton(purpleButtonStyle);
const WhiteButton = makeButton(whiteButtonStyle);

export {PurpleButton, WhiteButton}
