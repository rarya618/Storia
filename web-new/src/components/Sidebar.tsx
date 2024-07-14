import { useEffect, useState } from "react";
import { BasicBlock, Folder } from "../datatypes/Block";
import { Link } from "react-router-dom";
import { topStyle } from "./HomeTopBar";
import { onValue } from "firebase/database";
import { getFoldersQueryForOwner } from "../firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft, faCaretDown, faCaretRight, faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import HeaderButton from "./HeaderButton";

const sidebarItemStyle = "px-5 py-2 mx-4 rounded font-light flex ";

const sidebarItemStandard = sidebarItemStyle + "text-purple dark:text-neutral-900 hover:bg-purple-tint-hover dark:hover:bg-neutral-900 dark:hover:bg-opacity-10";
const sidebarItemCurrent = sidebarItemStyle + "text-white dark:text-purple bg-purple dark:bg-neutral-900 hover:bg-opacity-90";

type Props = {
  current?: string
}

interface SidebarProps extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void
}

interface SidebarSectionProps extends Props {
  folder: Folder,
  current?: string
}

interface SidebarItemProps extends Props {
  folder?: Folder,
  project?: BasicBlock
  current?: string,
  showSubItem?: boolean,
  toggleSubItems?: () => void
}

const SidebarItem = (props: SidebarItemProps) => {
  let content = props.folder ? props.folder : props.project;

  if (content) {
    let isCurrent = props.current && (props.current == content.id);
    return (
      <Link to={"/" + content.type + "/" + content.id}>
        <div className={ (isCurrent ? sidebarItemCurrent : sidebarItemStandard) + (content.type == "project" ? " pl-10" : "")}>
          <FontAwesomeIcon 
            icon={props.folder ? 
              (props.folder.projects ? 
              (props.showSubItem ? faCaretDown: faCaretRight) 
              : faFolder) 
              : faFile} 
            className="my-auto mr-1 w-5 py-1 hover:bg-neutral-900 hover:bg-opacity-10 z-5"
            onClick={(event) => {
              event.preventDefault();
              if (props.toggleSubItems) {
                props.toggleSubItems();
              }}} />
          <p className="text-sm my-auto">{content.name}</p>
        </div>
      </Link>
    )
  }
}

const SidebarSection = (props: SidebarSectionProps) => {
  const [showSubItems, setShowSubItems] = useState(false);
  const toggleSubItems = () => {
    setShowSubItems(!showSubItems)
  }

  return (<>
    <SidebarItem folder={props.folder}
        showSubItem={showSubItems}
        toggleSubItems={toggleSubItems}
        current={props.current} />
    {props.folder.projects && showSubItems && (
      <SidebarItem
      // @ts-ignore
        project={props.folder.projects[Object.keys(props.folder.projects)[0]]}
        current={props.current}
      />
    )}
  </>)
}

const Sidebar = ({current, isSidebarVisible, toggleSidebarVisible}: SidebarProps) => {
  // get user credentials
  let uid = sessionStorage.getItem('User ID');
  let userId = uid ? uid : "";

  const [folders, setFolders] = useState<Folder[]>();

  // folders getter
  async function getFolders() {
    const query = getFoldersQueryForOwner(userId);

    if (query) {
      onValue(query, (snapshot) => {
        const dataList: Folder[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({id: childSnapshot.key, ...childSnapshot.val()});
        })

        setFolders(dataList);
      });
    }
  }

  // call getters
  useEffect(() => {
    getFolders();
  }, [])

  return (
    <>{ isSidebarVisible ?
    <div className="w-96 bg-purple-tint dark:bg-purple sticky top-0 select-none"> {/* sidebar */}
      <div className={topStyle}>
        <div className="flex-grow"></div>
        <HeaderButton icon={faAngleDoubleLeft} isSidebar={true} onClick={toggleSidebarVisible}/>
      </div>
      <h2 className="ml-5 mb-1 text-xs font-bold text-purple dark:text-neutral-900">Folders</h2>
      <div className="flex flex-col">
        {folders ? folders.map(folder => {
          return (
            <SidebarSection folder={folder} current={current} />
          )
        }) : null}
      </div>
    </div>
    : null}</>
  )
}

export default Sidebar