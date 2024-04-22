import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Project } from "../datatypes/Project";
import { getProjectRef } from "../firebase/database";
import { onValue } from "firebase/database";
import Loading from "../components/Loading";
import HeaderButton from "../components/HeaderButton";
import { faCaretLeft, faEllipsisVertical, faFile } from "@fortawesome/free-solid-svg-icons";
import { shadowedWhiteColor } from "../styles/colors";
import { PurpleButton, WhiteButton } from "../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ProjectView = () => {
  // initialise Project
  const [project, setProject] = useState<Project>();
  let { id } = useParams<string>();

  let projectId = id ? id : "";

  async function getProject() {
    const projectRef = getProjectRef(projectId);

    if (projectRef) {
      onValue(projectRef, (snapshot) => {
        const data = {id: projectId, ...snapshot.val()};
        setProject(data);
      });
    }
  }

  // call project getter
  useEffect(() => {
    getProject();
  }, [])

  return (
    <div className="flex h-screen w-screen"> {/* page */}
      {
        project ?
        <>
          <div className="w-80 bg-purple-tint dark:bg-purple-deep-tint"> {/* sidebar */}
          
          </div>
          <div className="flex flex-col w-full"> {/* main view */}
            <div className={shadowedWhiteColor + " flex h-11 px-4 select-none"}> {/* main view top */}
              <Link to="/">
                <HeaderButton icon={faCaretLeft} />
              </Link>
              <div className="my-auto ml-2">
                <p className="text-purple">{project.name}</p>
              </div>
              <div className="flex-grow"></div>
              <div className="my-auto"> {/* dot menu */}
                <HeaderButton icon={faEllipsisVertical} />
              </div>
            </div>
            <div className="flex flex-col p-10 flex-grow"> {/* main view safe area */}
              <div className="flex"> {/* main view top */}
                <h1 className="flex-grow text-3xl text-purple font-light select-none">{project.name}</h1>
                <div className="flex m-auto">
                  <WhiteButton text="Settings" link="settings" isSmall={true} />
                </div>
                <div className="flex m-auto ml-4">
                  <PurpleButton text="New Document" link="create" isSmall={true} />
                </div>
              </div>
              <div className="flex flex-col flex-grow w-full">
                { 
                  project.documents ? 
                  <>
                    <div className="mx-auto py-10">
                      { project.documents.map(projectDoc => {
                        return (
                          <div>
                            <p>{projectDoc}</p>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mx-auto">
                      <PurpleButton text="Add more" link="create" isSmall={true} />
                    </div>
                  </> : <>
                    <div className="m-auto justify-center flex flex-col h-full py-10">
                      <FontAwesomeIcon className="text-purple text-8xl p-0 mb-5" icon={faFile} />
                      <p className="text-purple text-sm m-0 mb-12 select-none">No documents found</p>
                      <div className="mx-auto">
                        <PurpleButton text="Create one" link="create" isSmall={true} />
                      </div>
                    </div>
                  </>
                }
                
              </div>
            </div>
          </div>
        </> :
        <Loading />
      }
      
    </div>
  )
}

export default ProjectView