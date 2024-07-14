import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { Folder, Project } from "../datatypes/Block";
import { getRelativeDate } from "../misc/date";

const Block = ({content}: {content: Folder | Project}) => {
  return (
    <Link to={"/" + content.type + "/" + content.id} className="group w-1/2 min-w-64 mt-5">
      <div key={content.id} className="group-hover:bg-purple-tint-hover flex flex-col flex-grow h-full px-6 py-7 border border-purple-md-tint mr-5 group-even:mr-0 group-last:mr-0 rounded-md">
        <div className="flex mb-1">
          <FontAwesomeIcon 
            className="text-purple text-xl p-0 m-0 mt-0.5 ml-0.5 mr-2.5" 
            icon={
              content.type == "folder" ?
              faFolder :
              faFile
            } />
          <h2 className="text-xl text-purple font-light m-0">{content.name}</h2>
          <div className="flex">
            <span className="mx-3 my-auto bg-purple text-white dark:text-neutral-900 px-2 py-0.5 rounded-full text-xs">{content.isPublic ? "Public" : "Private"}</span>
          </div>
        </div>
        <p className="text-purple leading-relaxed flex-grow">{content.description}</p>
        <p className="text-sm mt-10 text-neutral-500 dark:text-neutral-400">{getRelativeDate(content.createdOn)}</p>
      </div>
    </Link>
  )
}

export default Block;