import { useEffect, useState } from "react";
import { BasicBlock, Folder, Project } from "../datatypes/Block";
import { Link } from "react-router-dom";
import { onValue } from "firebase/database";
import { getFoldersQueryForOwner, getProjectsQueryForOwner } from "../firebase/database";
import { rememberHome, seenHomeFolders, seenHomeProjects } from "../misc/seen";
import StrokeIcon from "./screenplay/StrokeIcon";
import AccountMenu from "./AccountMenu";
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
  // with a folder's id, the project is made in that folder
  onNewProject: (folderId?: string) => void,
  onSettings: () => void,
}

interface SidebarSectionProps extends Props {
  folder: Folder,
  onNavigate?: () => void,
  onNewProject: (folderId: string) => void,
}

// a section's Label with its + at the right. The button hangs into the gap
// around the label, so the label sits 8px above its rows; it is a compact 28px
// with a mouse and keeps 36px to tap. With a mouse it shows while the pointer
// is over its section, or when it has keyboard focus; on touch it always shows
const SectionLabel = ({label, action, onAction, className}: {label: string, action: string, onAction: () => void, className: string}) => (
  <div className={"mb-2 flex items-center justify-between pl-2 " + className}>
    <h2 className="sw-label">{label}</h2>
    <button type="button" className="sw-icon -my-2 transition-opacity duration-[120ms] [@media(pointer:fine)]:-my-1 [@media(pointer:fine)]:!h-7 [@media(pointer:fine)]:!w-7 [@media(pointer:fine)]:!rounded-md [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/section:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100" onClick={onAction} aria-label={action} title={action}>
      <StrokeIcon name="plus" size={16} />
    </button>
  </div>
);

// a project under its folder, its name a 16px step in from the folder's, or (nested false) one in no folder, level with the folders
const ProjectRow = ({project, current, onNavigate, nested = true}: {project: BasicBlock, current?: string, onNavigate?: () => void, nested?: boolean}) => {
  const isCurrent = current == project.id;
  return (
    <li>
      <Link
        to={"/project/" + project.id}
        aria-current={isCurrent ? "page" : undefined}
        onClick={onNavigate}
        className={(isCurrent ? rowCurrent : rowStandard) + (nested ? " pl-[48px]" : "")}
      >
        {!nested && <span aria-hidden="true" />}
        <span className="col-span-2 truncate">{project.name}</span>
      </Link>
    </li>
  );
};

const SidebarSection = ({folder, current, onNavigate, onNewProject}: SidebarSectionProps) => {
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
      <div className={(isCurrent ? rowCurrent : rowStandard) + " group/row"}>
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
        {/* the count, which gives way to a + while the row is hovered or has
            keyboard focus; touch has the folder page's New project instead */}
        <span className="grid items-center justify-items-end">
          {projects.length > 0 && (
            <span className={"col-start-1 row-start-1 text-sm tabular-nums transition-opacity duration-[120ms] [@media(hover:hover)]:group-focus-within/row:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-0" + (isCurrent ? " text-[color:var(--on-select)]" : " text-[color:var(--muted)]")} aria-label={projects.length + (projects.length == 1 ? " project" : " projects")}>
              {projects.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => { setOpen(true); onNewProject(folder.id); }}
            aria-label={"New project in " + folder.name}
            title={"New project in " + folder.name}
            className="col-start-1 row-start-1 -my-1 flex h-6 w-6 items-center justify-center rounded-[4px] text-[color:var(--muted)] opacity-0 transition-opacity duration-[120ms] hover:bg-black/5 hover:text-[color:var(--ui)] group-focus-within/row:opacity-100 group-hover/row:opacity-100 [@media(hover:none)]:hidden"
          >
            <StrokeIcon name="plus" size={15} />
          </button>
        </span>
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

const Sidebar = ({ current, isSidebarVisible, toggleSidebarVisible, onNewFolder, onNewProject, onSettings }: SidebarProps) => {
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
            <section className="group/section">
              <SectionLabel label="Folders" action="New folder" onAction={onNewFolder} className="mt-1" />
              {folders && folders.length > 0 && (
                <ul className="flex flex-col gap-px">
                  {folders.map((folder) => (
                    <SidebarSection key={folder.id} folder={folder} current={current} onNavigate={closeOnSmallScreens} onNewProject={onNewProject} />
                  ))}
                </ul>
              )}
              {folders && folders.length == 0 && (
                <p className="px-2 pt-1 text-sm text-[color:var(--ui)]">No folders yet. Use + to make one.</p>
              )}
            </section>

            {/* projects in no folder; its + makes one there */}
            <section className="group/section">
              <SectionLabel label="Projects" action="New project" onAction={() => onNewProject()} className="mt-6" />
              {looseProjects.length > 0 && (
                <ul className="flex flex-col gap-px">
                  {looseProjects.map((project) => (
                    <ProjectRow key={project.id} project={project} current={current} onNavigate={closeOnSmallScreens} nested={false} />
                  ))}
                </ul>
              )}
              {projects && looseProjects.length == 0 && (
                <p className="px-2 pt-1 text-sm text-[color:var(--ui)]">Projects outside a folder appear here.</p>
              )}
            </section>
          </div>

          <AccountMenu onSettings={onSettings} />
        </div>
      </nav>
    </>
  );
};

export default Sidebar
