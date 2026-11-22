import { Link } from "react-router-dom";
import { getRelativeDate } from "../../misc/date";
import StrokeIcon from "./StrokeIcon";

export type ProjectDocument = {
  id: string,
  name: string,
  description?: string,
  lastUpdated?: string,
  createdOn?: string,
};

type ProjectSidebarProps = {
  projectId?: string,
  projectName?: string,
  documents: ProjectDocument[],
  currentId: string,
  onCollapse: () => void,
};

// the right sidebar: the other documents in this project
const ProjectSidebar = ({projectId, projectName, documents, currentId, onCollapse}: ProjectSidebarProps) => {
  return (
    <div className="flex h-full w-[300px] flex-col border-l border-[color:var(--hair)] bg-[color:var(--paper)]">
      <div className="flex h-11 shrink-0 items-center gap-2 px-[15px]">
        <button type="button" className="sw-icon" onClick={onCollapse} aria-label="Hide project" title="Hide project">
          <StrokeIcon name="collapseRight" />
        </button>
        {projectId && (
          <Link
            to={"/project/" + projectId}
            className="flex h-[26px] min-w-0 flex-1 items-center rounded-[5px] border border-[color:var(--hair)] px-3 text-[12px] hover:bg-[color:var(--wash)]"
            title="Open project"
          >
            <span className="truncate">{projectName ?? "Project"}</span>
          </Link>
        )}
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-[15px] pb-6 flex flex-col gap-3" aria-label="Documents in this project">
        {documents.map(doc => {
          const isCurrent = doc.id === currentId;
          const when = doc.lastUpdated ?? doc.createdOn;
          const body = (
            <>
              <p className="flex items-center gap-2 text-[15px] leading-[22px]">
                {isCurrent && <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{background: "var(--signal)"}} aria-hidden="true" />}
                <span className="truncate">{doc.name}</span>
              </p>
              {doc.description && <p className="mt-1 line-clamp-5 text-[12.5px] leading-[18px] text-[color:var(--muted)]">{doc.description}</p>}
              {when && <p className="mt-4 text-[11px] text-[color:var(--muted)]">{(doc.lastUpdated ? "Updated " : "Created ") + getRelativeDate(when)}</p>}
            </>
          );
          return (
            <li key={doc.id}>
              {isCurrent ? (
                <div aria-current="page" className="rounded-[2px] border border-[color:var(--hair-strong)] bg-[color:var(--wash)] p-[15px]">{body}</div>
              ) : (
                <Link to={"/document/" + doc.id} className="block rounded-[2px] border border-[color:var(--hair)] p-[15px] transition-colors hover:bg-[color:var(--wash)]">{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProjectSidebar;
