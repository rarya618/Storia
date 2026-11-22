import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { Folder, Project } from "../datatypes/Block";
import { getActivityLabel } from "../misc/date";

const Block = ({content}: {content: Folder | Project}) => {
  return (
    <Link
      to={"/" + content.type + "/" + content.id}
      className="group flex flex-col h-full px-5 py-5 border border-neutral-200 dark:border-neutral-700 rounded-md transition-colors hover:bg-neutral-50 hover:border-neutral-300 dark:hover:bg-neutral-800 dark:hover:border-neutral-600"
    >
      <div className="flex items-start gap-2.5 mb-1 min-w-0">
        <FontAwesomeIcon
          className="text-purple text-lg shrink-0 mt-1 ml-0.5"
          icon={content.type == "folder" ? faFolder : faFile}
          aria-hidden="true" />
        <h2 className="text-lg text-purple font-light m-0 min-w-0 flex-grow break-words">{content.name}</h2>
        <span className="shrink-0 mt-1 bg-purple text-white dark:text-neutral-900 px-2 py-0.5 rounded-full text-xs">{content.isPublic ? "Public" : "Private"}</span>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-6 flex-grow line-clamp-3 break-words">{content.description}</p>
      <p className="text-xs mt-8 text-neutral-500 dark:text-neutral-400">{getActivityLabel(content)}</p>
    </Link>
  )
}

export default Block;
