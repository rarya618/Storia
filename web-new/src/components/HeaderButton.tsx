import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

type HeaderButtonProps = {
    icon?: IconDefinition,
    text?: string,
    label?: string,
    to?: string,
    onClick?: () => void,
    isSidebar?: boolean,
    disabled?: boolean,
    expanded?: boolean,
}

const HeaderButton = ({icon, text, label, to, onClick, isSidebar, disabled, expanded}: HeaderButtonProps) => {
    const className =
        "px-2 py-0 ml-2 h-8 min-w-8 rounded-md text-purple hover:bg-purple-tint-hover flex items-center justify-center space-x-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent " +
        (isSidebar
        ? "dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:bg-opacity-10"
        : "");

    const content = <>
        {icon && <FontAwesomeIcon icon={icon} className="h-4 w-4" />}
        {text && <span className="text-sm px-1">{text}</span>}
    </>;

    if (to)
        return <Link to={to} className={className} aria-label={label} title={label}>{content}</Link>;

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            aria-label={label}
            title={label}
            disabled={disabled}
            aria-expanded={expanded}
        >
            {content}
        </button>
    )
}

export default HeaderButton;
