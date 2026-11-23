import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Folder, Project } from "../datatypes/Block";
import { getActivityLabel } from "../misc/date";
import StrokeIcon from "./screenplay/StrokeIcon";

// "5 documents" with the number leading, or "No documents"
export const Counted = ({count, one, many}: {count: number, one: string, many: string}) =>
  count === 0
    ? <>No {many}</>
    : <><span className="sw-fig">{count}</span> {count === 1 ? one : many}</>;

// a quiet card: the name, what it's about, and a ruled foot pinned to the bottom
const Card = ({to, name, description, place, count, activity}: {to: string, name: string, description?: string, place?: ReactNode, count: ReactNode, activity: string}) => (
  <li className="flex">
    <Link to={to} className="sw-card flex-1 px-4 pb-3 pt-3.5">
      <h3 title={name} className="sw-card-name line-clamp-2 text-sm">{name}</h3>
      {description && <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[color:var(--muted)]">{description}</p>}
      <div className="min-h-4 flex-1" aria-hidden="true" />
      <div className="sw-card-foot text-xs">
        {place}
        {/* the count and the activity each wrap whole, never leaving a word behind */}
        <p className="flex flex-wrap justify-between gap-x-3">
          <span className="whitespace-nowrap">{count}</span>
          <span className="whitespace-nowrap">{activity}</span>
        </p>
      </div>
    </Link>
  </li>
);

const Place = ({children}: {children: ReactNode}) => (
  <p className="sw-card-place">
    <StrokeIcon name="folder" size={13} />
    <span>{children}</span>
  </p>
);

// home names every project's folder, "No folder" included; the folder page names none
export const ProjectCard = ({project, folderName}: {project: Project, folderName?: string | null}) => (
  <Card
    to={"/project/" + project.id}
    name={project.name}
    description={project.description}
    place={folderName !== undefined && <Place>{folderName ?? "No folder"}</Place>}
    count={<Counted count={Object.keys(project.documents ?? {}).length} one="document" many="documents" />}
    activity={getActivityLabel(project)}
  />
);

export const FolderCard = ({folder}: {folder: Folder}) => {
  const names = Object.values(folder.projects ?? {}).map(project => project?.name).filter(Boolean);
  return (
    <Card
      to={"/folder/" + folder.id}
      name={folder.name}
      description={folder.description}
      place={names.length > 0 && <p className="truncate text-[color:var(--ui)]" title={names.join(", ")}>{names.join(", ")}</p>}
      count={<Counted count={names.length} one="project" many="projects" />}
      activity={getActivityLabel(folder)}
    />
  );
};

// the dashed card that closes a grid and starts something new
export const NewCard = ({label, onClick}: {label: string, onClick: () => void}) => (
  <li className="flex">
    <button type="button" onClick={onClick} className="sw-card-new min-h-[104px] text-xs">
      <StrokeIcon name="plus" size={16} />
      {label}
    </button>
  </li>
);

// cards in a row share its tallest card's height; rows without descriptions stay short
export const cardGrid = "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3";
