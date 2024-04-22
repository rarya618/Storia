import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const HeaderButton = ({icon, onClick}: {icon: IconDefinition, onClick?: () => void}) => {    
    return (
        <button 
            className="p-2 h-9 text-purple hover:bg-purple-tint ml-2 mt-1 rounded"
            onClick={onClick}>
            <FontAwesomeIcon className="p-0 m-0 text-xl" icon={icon} />
        </button>
    )
}

export default HeaderButton;