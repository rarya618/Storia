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

const cardStyle = "block rounded-lg border bg-[color:var(--paper)] px-3 py-2.5 transition-colors";

// the right sidebar: the documents in this project
const ProjectSidebar = ({projectId, projectName, documents, currentId, onCollapse}: ProjectSidebarProps) => {
  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-[color:var(--hair)] bg-[color:var(--tint)]">
      <div className="flex h-11 shrink-0 items-center gap-2 pl-2.5 pr-4">
        <button type="button" className="sw-icon" onClick={onCollapse} aria-label="Hide project" title="Hide project">
          <StrokeIcon name="collapseRight" />
        </button>
        {projectId ? (
          <Link to={"/project/" + projectId} className="min-w-0 truncate text-[13px] font-semibold tracking-tight hover:underline hover:underline-offset-4" title="Open project">
            {projectName ?? "Project"}
          </Link>
        ) : (
          <span className="text-[13px] font-semibold tracking-tight">Documents</span>
        )}
      </div>

      <p className="flex shrink-0 items-baseline justify-between px-4 pb-2 pt-1 text-[11.5px] font-medium text-[color:var(--muted)]">
        <span>Documents</span>
        <span className="tabular-nums">{documents.length}</span>
      </p>

      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-6" aria-label="Documents in this project">
        {documents.map(doc => {
          const isCurrent = doc.id === currentId;
          const when = doc.lastUpdated ?? doc.createdOn;
          const body = (
            <>
              <p className={"truncate text-[13px] font-semibold leading-5 tracking-tight" + (isCurrent ? " text-[color:var(--on-select)]" : "")}>{doc.name}</p>
              {doc.description && <p className="mt-0.5 line-clamp-2 text-[12px] leading-[18px] text-[color:var(--muted)]">{doc.description}</p>}
              {when && <p className="mt-1.5 text-[11px] text-[color:var(--muted)]">{(doc.lastUpdated ? "Updated " : "Created ") + getRelativeDate(when)}</p>}
            </>
          );
          return (
            <li key={doc.id}>
              {isCurrent ? (
                <div aria-current="page" className={cardStyle + " border-[color:var(--select-border)] !bg-[color:var(--select-card)] shadow-[0_1px_2px_rgb(0_0_0/0.04)]"}>{body}</div>
              ) : (
                <Link to={"/document/" + doc.id} className={cardStyle + " border-[color:var(--hair)] hover:border-[color:var(--hair-strong)] hover:shadow-[0_1px_2px_rgb(0_0_0/0.04)]"}>{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProjectSidebar;
