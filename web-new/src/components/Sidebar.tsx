import { useEffect, useState } from "react";
import { BasicBlock, Folder } from "../datatypes/Block";
import { Link } from "react-router-dom";
import { topStyle } from "./HomeTopBar";
import { onValue } from "firebase/database";
import { getFoldersQueryForOwner } from "../firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft, faCaretDown, faCaretRight, faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import HeaderButton from "./HeaderButton";

const sidebarItemStyle = "px-4 py-1.5 mx-4 rounded flex ";

export const standardColor = "text-purple dark:text-neutral-900 hover:bg-purple-tint-hover font-normal dark:hover:bg-neutral-900 dark:hover:bg-opacity-10";
export const currentColor = "text-purple-tint dark:text-purple font-black bg-purple dark:bg-neutral-800 hover:bg-opacity-90";

const sidebarItemStandard = sidebarItemStyle + standardColor;
const sidebarItemCurrent = sidebarItemStyle + currentColor;

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
        <div className={ (isCurrent ? sidebarItemCurrent : sidebarItemStandard) + (content.type == "project" ? " pl-9" : "")}>
          <FontAwesomeIcon 
            icon={props.folder ? 
              (props.folder.projects ? 
              (props.showSubItem ? faCaretDown: faCaretRight) 
              : faFolder) 
              : faFile} 
            aria-label="Toggle sub-items"
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
    {props.folder.projects && showSubItems && Object.entries(props.folder.projects).map(([id, project]) => (
      <SidebarItem
        key={id}
        project={project as BasicBlock}
        current={props.current}
      />
    ))}
  </>)
}

const Sidebar = ({ current, isSidebarVisible, toggleSidebarVisible }: SidebarProps) => {
  let uid = sessionStorage.getItem("User ID");
  let userId = uid ? uid : "";

  const [folders, setFolders] = useState<Folder[]>();

  useEffect(() => {
    const query = getFoldersQueryForOwner(userId);
    if (query) {
      onValue(query, (snapshot) => {
        const dataList: Folder[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        setFolders(dataList);
      });
    }
  }, []);

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isSidebarVisible ? "w-80 px-0" : "w-0 px-0 overflow-hidden"}
        bg-purple-tint dark:bg-purple sticky top-0 select-none h-full
      `}
    >
      <div
        className={`
          transition-opacity duration-300 ease-in-out
          ${isSidebarVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className={topStyle}>
          <p className="logo text-purple dark:text-neutral-900 ml-1 my-auto text-xl">Storia</p>
          <div className="flex-grow" />
          <div className="my-auto">
            <HeaderButton icon={faAngleDoubleLeft} isSidebar={true} onClick={toggleSidebarVisible} />
          </div>
        </div>

        <h2 className="ml-5 mb-1 text-xs font-bold text-purple dark:text-neutral-900">Folders</h2>
        <div className="flex flex-col">
          {folders?.map((folder) => (
            <SidebarSection key={folder.id} folder={folder} current={current} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar