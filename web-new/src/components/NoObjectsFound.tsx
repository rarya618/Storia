import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { PurpleButton } from "./Button"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"

const NoObjectsFound = ({icon, buttonOnClick, text}: {icon: IconDefinition, buttonOnClick: () => void, text: string}) => {
  return (
    <div className="m-auto justify-center flex flex-col h-full py-10">
      <FontAwesomeIcon className="text-purple text-8xl p-0 mb-5" icon={icon} />
      <p className="text-purple text-sm m-0 mb-12 select-none">No {text}s found</p>
      <div className="mx-auto">
        <PurpleButton text="Create one" onClick={buttonOnClick} />
      </div>
    </div>
  )
}

export default NoObjectsFound