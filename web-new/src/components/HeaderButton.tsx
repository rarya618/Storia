import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HeaderButton = ({icon, text, onClick, isSidebar}: {icon?: IconDefinition, text?: string, onClick?: () => void, isSidebar?: boolean}) => {    
    return (
        <button
            onClick={onClick}
            className={
                "px-2 py-0 ml-2 h-8 rounded-md text-purple hover:bg-purple-tint-hover flex items-center justify-center space-x-2 " +
                (isSidebar
                ? "dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:bg-opacity-10"
                : "")
            }
        >
            {icon && <FontAwesomeIcon icon={icon} className="h-4 w-4" />}
            {text && <span className="text-sm px-1">{text}</span>}
        </button>
    )
}

export default HeaderButton;