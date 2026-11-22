import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { PurpleButton } from "./Button"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

const NoObjectsFound = ({icon, buttonOnClick, text}: {icon: IconDefinition, buttonOnClick: () => void, text: string}) => {
  return (
    <div className="m-auto flex flex-col items-center text-center py-16">
      <FontAwesomeIcon className="text-purple/30 text-6xl mb-5" icon={icon} aria-hidden="true" />
      <p className="display text-lg text-purple m-0 select-none">No {text}s yet</p>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1 mb-6 select-none">Create your first {text} to get started.</p>
      <PurpleButton text={"New " + text.charAt(0).toUpperCase() + text.slice(1)} onClick={buttonOnClick} />
    </div>
  )
}

export default NoObjectsFound
