import { useEffect, useState } from "react";
import { BasicBlock, Folder, Project } from "../datatypes/Block";
import { Link } from "react-router-dom";
import { onValue } from "firebase/database";
import { getFoldersQueryForOwner, getProjectsQueryForOwner } from "../firebase/database";
import { rememberHome, seenHomeFolders, seenHomeProjects } from "../misc/seen";
import StrokeIcon from "./screenplay/StrokeIcon";
import "../screenplay/world.css";

// rows follow the editor's scene list: a 16px lead column, the name, a quiet count
const rowStyle = "sw-row grid grid-cols-[16px_1fr_auto] items-center gap-x-2 px-2 py-[5px] text-xs leading-5";
const rowStandard = rowStyle;
const rowCurrent = rowStyle + " is-current font-bold";

type Props = {
  current?: string
}

interface SidebarProps extends Props {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void,
  onNewFolder: () => void,
}

interface SidebarSectionProps extends Props {
  folder: Folder,
  onNavigate?: () => void
}

// a project under its folder, or (nested false) one in no folder, level with the folders
const ProjectRow = ({project, current, onNavigate, nested = true}: {project: BasicBlock, current?: string, onNavigate?: () => void, nested?: boolean}) => {
  const isCurrent = current == project.id;
  return (
    <li>
      <Link
        to={"/project/" + project.id}
        aria-current={isCurrent ? "page" : undefined}
        onClick={onNavigate}
        className={(isCurrent ? rowCurrent : rowStandard) + (nested ? " pl-[32px]" : "")}
      >
        {!nested && <span aria-hidden="true" />}
        <span className="col-span-2 truncate">{project.name}</span>
      </Link>
    </li>
  );
};

const SidebarSection = ({folder, current, onNavigate}: SidebarSectionProps) => {
  const projects = Object.entries(folder.projects ?? {}) as [string, BasicBlock][];
  const isCurrent = current == folder.id;

  // expanded when the current page is this folder or one of its projects; the
  // rail stays mounted between screens, so open again whenever that becomes true
  const holdsCurrent = Boolean(current && (current == folder.id || projects.some(([id]) => id == current)));
  const [isOpen, setOpen] = useState(holdsCurrent);
  useEffect(() => {
    if (holdsCurrent) setOpen(true);
  }, [holdsCurrent]);

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

const Sidebar = ({ current, isSidebarVisible, toggleSidebarVisible, onNewFolder }: SidebarProps) => {
  const userId = sessionStorage.getItem("User ID") ?? "";

  // the rail reads the same lists as home, so either one fills the other
  const [folders, setFolders] = useState<Folder[] | undefined>(seenHomeFolders);
  const [projects, setProjects] = useState<Project[] | undefined>(seenHomeProjects);

  // on small screens the sidebar covers the page, so close it after navigating
  const closeOnSmallScreens = () => {
    if (window.matchMedia("(max-width: 767px)").matches) toggleSidebarVisible();
  };

  useEffect(() => {
    const foldersQuery = getFoldersQueryForOwner(userId);
    const projectsQuery = getProjectsQueryForOwner(userId);

    const unsubscribers = [
      foldersQuery && onValue(foldersQuery, (snapshot) => {
        const dataList: Folder[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        rememberHome(dataList, undefined);
        setFolders(dataList);
      }, () => setFolders([])),
      projectsQuery && onValue(projectsQuery, (snapshot) => {
        const dataList: Project[] = [];
        snapshot.forEach((childSnapshot) => {
          dataList.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        rememberHome(undefined, dataList);
        setProjects(dataList);
      }, () => setProjects([])),
    ];

    return () => unsubscribers.forEach(unsubscribe => unsubscribe?.());
  }, [userId]);

  // projects that sit in no folder, which the folder sections can't show
  const looseProjects = (projects ?? []).filter(project => !project.folderId);

  return (
    <>
      {/* on small screens the sidebar overlays the page, so dim what's behind it */}
      {isSidebarVisible && (
        <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={toggleSidebarVisible} aria-hidden="true" />
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
            {/* folders are made where they're listed */}
            <div className="mb-1 flex items-center justify-between pl-2">
              <h2 className="sw-label">Folders</h2>
              <button type="button" className="sw-icon" onClick={onNewFolder} aria-label="New folder" title="New folder">
                <StrokeIcon name="plus" size={16} />
              </button>
            </div>
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

            {looseProjects.length > 0 && <>
              <h2 className="sw-label mb-2 mt-6 px-2">Projects</h2>
              <ul className="flex flex-col gap-px">
                {looseProjects.map((project) => (
                  <ProjectRow key={project.id} project={project} current={current} onNavigate={closeOnSmallScreens} nested={false} />
                ))}
              </ul>
            </>}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar
