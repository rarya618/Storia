import { Link } from "react-router-dom";
import { getRelativeDate } from "../../misc/date";
import StrokeIcon from "./StrokeIcon";
import { inDraftOrder, revisionAt } from "../../screenplay/revisions";

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

// the right sidebar: the documents in this project, each on its revision colour
const ProjectSidebar = ({projectId, projectName, documents, currentId, onCollapse}: ProjectSidebarProps) => {
  const revisionOf = new Map(inDraftOrder(documents).map((doc, index) => [doc.id, revisionAt(index)]));
  return (
    <div className="sw-rail flex h-full w-[300px] shrink-0 flex-col border-l">
      <div className="flex h-16 shrink-0 items-center gap-2 pl-3 pr-4">
        <button type="button" className="sw-icon" onClick={onCollapse} aria-label="Hide project" title="Hide project">
          <StrokeIcon name="collapseRight" />
        </button>
        {projectId ? (
          <Link to={"/project/" + projectId} className="min-w-0 truncate text-base font-bold hover:underline hover:underline-offset-4" title="Open project">
            {projectName ?? "Project"}
          </Link>
        ) : (
          <span className="text-base font-bold">Documents</span>
        )}
      </div>

      {projectId && (
        <div className="shrink-0 px-3 pb-3">
          <Link to={"/project/" + projectId + "/board"} className="sw-row flex items-center gap-2 px-2.5 py-2 text-sm font-semibold">
            <StrokeIcon name="board" size={16} />
            Board
          </Link>
        </div>
      )}

      <p className="sw-label flex shrink-0 items-baseline justify-between px-4 pb-2 pt-1">
        <span>Documents</span>
        <span className="tabular-nums">{documents.length}</span>
      </p>

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-6" aria-label="Documents in this project">
        {documents.map(doc => {
          const isCurrent = doc.id === currentId;
          const when = doc.lastUpdated ?? doc.createdOn;
          const revision = revisionOf.get(doc.id);
          const body = (
            <>
              {revision && <span className="sw-band" style={{background: revision.color}} aria-hidden="true" />}
              <span className="block px-3 pb-3 pt-2.5">
                <span className="sw-card-name line-clamp-2 block text-base">{doc.name}</span>
                {doc.description && <span className="mt-1 line-clamp-2 block text-sm text-[color:var(--muted)]">{doc.description}</span>}
                <span className="mt-2 flex flex-wrap items-center justify-between gap-x-2 text-sm text-[color:var(--muted)]">
                  {when && <span>{(doc.lastUpdated ? "Updated " : "Created ") + getRelativeDate(when)}</span>}
                  {revision && <span>{revision.name} pages</span>}
                </span>
              </span>
            </>
          );
          return (
            <li key={doc.id}>
              {isCurrent ? (
                <div aria-current="page" className="sw-card overflow-hidden">{body}</div>
              ) : (
                <Link to={"/document/" + doc.id} className="sw-card overflow-hidden">{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProjectSidebar;
