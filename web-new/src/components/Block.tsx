import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { Folder, Project } from "../datatypes/Block";
import { getRelativeDate } from "../misc/date";

const Block = ({content}: {content: Folder | Project}) => {
  return (
    <Link to={"/" + content.type + "/" + content.id} className="group">
      <div key={content.id} className="group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800 flex flex-col flex-grow h-full px-5 pt-5 pb-5 border border-neutral-200 dark:border-neutral-700 rounded-md">
        <div className="flex mb-1">
          <FontAwesomeIcon 
            className="text-purple text-lg p-0 m-0 mt-1 ml-0.5 mr-2.5" 
            icon={
              content.type == "folder" ?
              faFolder :
              faFile
            } />
          <h2 className="text-lg text-purple font-light m-0">{content.name}</h2>
          <div className="flex">
            <span className="mx-3 my-auto bg-purple text-white dark:text-neutral-900 px-2 py-0.5 rounded-full text-xs">{content.isPublic ? "Public" : "Private"}</span>
          </div>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-6 flex-grow">{content.description}</p>
        <p className="text-xs mt-8 text-neutral-500 dark:text-neutral-500">
          {content.lastUpdated ? "Updated " : "Created "}
          {getRelativeDate(content.lastUpdated ? content.lastUpdated : content.createdOn)}
        </p>
      </div>
    </Link>
  )
}

export default Block;