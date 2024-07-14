import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const HeaderButton = ({icon, onClick, isSidebar}: {icon: IconDefinition, onClick?: () => void, isSidebar?: boolean}) => {    
    return (
        <button 
            className={"p-2 w-9 h-9 ml-2 mt-1 rounded-md text-purple hover:bg-purple-tint-hover " + (isSidebar ? "dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:bg-opacity-10" : "")}
            onClick={onClick}>
            <FontAwesomeIcon className="p-0 m-0 text-xl" icon={icon} />
        </button>
    )
}

export default HeaderButton;