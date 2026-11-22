import { useEffect, useState } from "react";
import { BasicBlock, Folder } from "../datatypes/Block";
import { Link } from "react-router-dom";
import { topStyle } from "./HomeTopBar";
import { onValue } from "firebase/database";
import { getFoldersQueryForOwner } from "../firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft, faCaretDown, faCaretRight, faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import HeaderButton from "./HeaderButton";

const sidebarItemStyle = "py-1.5 mx-3 rounded flex items-center min-w-0 transition-colors ";

export const standardColor = "text-purple dark:text-neutral-900 hover:bg-purple-tint-hover font-normal dark:hover:bg-neutral-900 dark:hover:bg-opacity-10";
export const currentColor = "text-white dark:text-purple font-semibold bg-purple dark:bg-neutral-800 hover:bg-opacity-90";

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
  const content = props.folder ? props.folder : props.project;
  if (!content) return null;

  const isCurrent = props.current == content.id;
  const hasProjects = Boolean(props.folder?.projects);
  const iconClass = "w-4 shrink-0";

  return (
    <div className={(isCurrent ? sidebarItemCurrent : sidebarItemStandard) + (content.type == "project" ? " pl-8 pr-3" : " pl-1 pr-3")}>
      {hasProjects ? (
        <button
          type="button"
          aria-label={(props.showSubItem ? "Collapse " : "Expand ") + content.name}
          aria-expanded={props.showSubItem}
          onClick={props.toggleSubItems}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-neutral-900/10"
        >
          <FontAwesomeIcon icon={props.showSubItem ? faCaretDown : faCaretRight} className={iconClass} />
        </button>
      ) : (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
          <FontAwesomeIcon icon={props.folder ? faFolder : faFile} className={iconClass} />
        </span>
      )}
      <Link
        to={"/" + content.type + "/" + content.id}
        aria-current={isCurrent ? "page" : undefined}
        className="ml-1 flex-grow truncate text-sm"
      >
        {content.name}
      </Link>
    </div>
  )
}

const SidebarSection = (props: SidebarSectionProps) => {
  // start expanded when the current page is one of this folder's projects
  const [showSubItems, setShowSubItems] = useState(
    Boolean(props.current && props.folder.projects && props.current in props.folder.projects)
  );
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
  const userId = sessionStorage.getItem("User ID") ?? "";

  const [folders, setFolders] = useState<Folder[]>();

  useEffect(() => {
    const query = getFoldersQueryForOwner(userId);
    if (!query) return;

    return onValue(query, (snapshot) => {
      const dataList: Folder[] = [];
      snapshot.forEach((childSnapshot) => {
        dataList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setFolders(dataList);
    }, () => setFolders([]));
  }, [userId]);

  return (
    <>
      {/* on small screens the sidebar overlays the page, so dim what's behind it */}
      {isSidebarVisible && (
        <div className="fixed inset-0 z-30 bg-neutral-900/30 md:hidden" onClick={toggleSidebarVisible} aria-hidden="true" />
      )}
      <nav
        aria-label="Folders"
        className={`
          transition-all duration-300 ease-out
          ${isSidebarVisible ? "w-72 shadow-xl md:shadow-none" : "w-0 overflow-hidden"}
          fixed md:sticky left-0 top-0 z-40 h-full shrink-0
          bg-purple-tint dark:bg-purple select-none
        `}
      >
        <div
          className={`
            w-72 transition-[opacity,visibility] duration-300 ease-out
            ${isSidebarVisible ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
        >
          <div className={topStyle}>
            <Link to="/home" className="logo text-purple dark:text-neutral-900 ml-1 text-xl">Storia</Link>
            <div className="flex-grow" />
            <HeaderButton icon={faAngleDoubleLeft} label="Hide sidebar" isSidebar={true} onClick={toggleSidebarVisible} />
          </div>

          <h2 className="ml-5 mt-2 mb-1 text-xs font-bold text-purple dark:text-neutral-900">Folders</h2>
          <div className="flex flex-col gap-0.5">
            {folders?.map((folder) => (
              <SidebarSection key={folder.id} folder={folder} current={current} />
            ))}
            {folders && folders.length == 0 && (
              <p className="mx-5 text-sm text-purple/80 dark:text-neutral-900/70">No folders yet</p>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar
