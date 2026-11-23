import { useEffect, useState } from "react";
import { BasicBlock, Folder } from "../datatypes/Block";
import { Link } from "react-router-dom";
import { onValue } from "firebase/database";
import { getFoldersQueryForOwner } from "../firebase/database";
import StrokeIcon from "./screenplay/StrokeIcon";
import "../screenplay/world.css";

// rows follow the editor's scene list: a 16px lead column, the name, a quiet count
const rowStyle = "sw-row grid grid-cols-[16px_1fr_auto] items-center gap-x-2 px-2 py-[5px] text-xs leading-5";
const rowStandard = rowStyle;
const rowCurrent = rowStyle + " is-current font-semibold tracking-tight";

type Props = {
  current?: string
}

interface SidebarProps extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void
}

interface SidebarSectionProps extends Props {
  folder: Folder,
  onNavigate?: () => void
}

const ProjectRow = ({project, current, onNavigate}: {project: BasicBlock, current?: string, onNavigate?: () => void}) => {
  const isCurrent = current == project.id;
  return (
    <li>
      <Link
        to={"/project/" + project.id}
        aria-current={isCurrent ? "page" : undefined}
        onClick={onNavigate}
        className={(isCurrent ? rowCurrent : rowStandard) + " pl-[32px]"}
      >
        <span className="col-span-2 truncate">{project.name}</span>
      </Link>
    </li>
  );
};

const SidebarSection = ({folder, current, onNavigate}: SidebarSectionProps) => {
  const projects = Object.entries(folder.projects ?? {}) as [string, BasicBlock][];
  const isCurrent = current == folder.id;

  // start expanded when the current page is this folder or one of its projects
  const [isOpen, setOpen] = useState(
    Boolean(current && (current == folder.id || projects.some(([id]) => id == current)))
  );

  return (
    <li>
      <div className={isCurrent ? rowCurrent : rowStandard}>
        {projects.length > 0 ? (
          <button
            type="button"
            aria-label={(isOpen ? "Collapse " : "Expand ") + folder.name}
            aria-expanded={isOpen}
            onClick={() => setOpen(!isOpen)}
            className="-m-1 flex h-6 w-6 items-center justify-center rounded-[4px] text-[color:var(--muted)] hover:bg-black/5"
          >
            <StrokeIcon name={isOpen ? "chevronDown" : "chevronRight"} size={15} />
          </button>
        ) : <span aria-hidden="true" />}
        <Link
          to={"/folder/" + folder.id}
          aria-current={isCurrent ? "page" : undefined}
          onClick={onNavigate}
          className="truncate"
        >
          {folder.name}
        </Link>
        {projects.length > 0 && (
          <span className={"text-sm tabular-nums" + (isCurrent ? " text-[color:var(--on-select)]" : " text-[color:var(--muted)]")} aria-label={projects.length + (projects.length == 1 ? " project" : " projects")}>
            {projects.length}
          </span>
        )}
      </div>
      {isOpen && (
        <ul className="mt-px flex flex-col gap-px">
          {projects.map(([id, project]) => (
            <ProjectRow key={id} project={{...project, id}} current={current} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ current, isSidebarVisible, toggleSidebarVisible }: SidebarProps) => {
  const userId = sessionStorage.getItem("User ID") ?? "";

  const [folders, setFolders] = useState<Folder[]>();

  // on small screens the sidebar covers the page, so close it after navigating
  const closeOnSmallScreens = () => {
    if (window.matchMedia("(max-width: 767px)").matches) toggleSidebarVisible();
  };

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
          sw sw-rev fixed left-0 top-0 z-40 h-screen shrink-0 select-none md:sticky
          transition-[width] duration-300 ease-out
          ${isSidebarVisible ? "w-[280px] max-md:shadow-[0_4px_16px_rgb(0_0_0/0.12)]" : "w-0 overflow-hidden"}
        `}
      >
        <div
          className={`
            sw-rail flex h-full w-[280px] flex-col border-r
            transition-[opacity,visibility] duration-300 ease-out
            ${isSidebarVisible ? "visible opacity-100" : "invisible opacity-0"}
          `}
        >
          <div className="flex h-16 shrink-0 items-center gap-2 pl-4 pr-3">
            <Link to="/home" onClick={closeOnSmallScreens} className="logo mr-auto text-2xl leading-none hover:opacity-80">Storia</Link>
            <button type="button" className="sw-icon" onClick={toggleSidebarVisible} aria-label="Hide sidebar" title="Hide sidebar">
              <StrokeIcon name="collapseLeft" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
            <h2 className="sw-label mb-2 mt-1 px-2">Folders</h2>
            {folders && folders.length > 0 && (
              <ul className="flex flex-col gap-px">
                {folders.map((folder) => (
                  <SidebarSection key={folder.id} folder={folder} current={current} onNavigate={closeOnSmallScreens} />
                ))}
              </ul>
            )}
            {folders && folders.length == 0 && (
              <p className="px-2 pt-1 text-sm text-[color:var(--ui)]">No folders yet. Folders you make on Home appear here.</p>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar
