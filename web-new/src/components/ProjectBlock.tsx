import { Link } from "react-router-dom"
import { Project } from "../datatypes/Project"

const ProjectBlock = ({project}: {project: Project}) => {
  return (
    <Link to={"/project/" + project.id}>
      <div key={project.id} className="px-6 py-7 border border-purple w-1/3 my-5 mr-5 rounded-md">
        <h2 className="text-xl text-purple font-light mb-1">{project.name}</h2>
        <p className="text-purple leading-relaxed">{project.description}</p>
      </div>
    </Link>
  )
}

export default ProjectBlock;