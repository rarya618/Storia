import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Folder, Project } from "../datatypes/Block";
import { getActivityLabel } from "../misc/date";
import StrokeIcon from "./screenplay/StrokeIcon";

const counted = (count: number, one: string, many: string) =>
  count === 0 ? "No " + many : count + " " + (count === 1 ? one : many);

const cardStyle = "flex h-full min-h-[132px] flex-col rounded-[8px] border border-[color:var(--hair)] bg-[color:var(--paper)] px-4 py-3.5 transition-[border-color,box-shadow,background-color] hover:border-[color:var(--hair-strong)] hover:shadow-[0_1px_2px_rgb(0_0_0/0.04)] focus-visible:!rounded-[8px] active:bg-[color:var(--tint)] active:shadow-none";

// a quiet document card: a name, what it's about, and a meta line pinned to the foot
const Card = ({to, name, description, meta}: {to: string, name: string, description?: string, meta: ReactNode}) => (
  <li>
    <Link to={to} className={cardStyle}>
      <h3 title={name} className="line-clamp-2 break-words text-[13px] font-semibold leading-[18px] tracking-tight">{name}</h3>
      {description && <p className="mt-1 line-clamp-3 break-words text-[12.5px] leading-[19px] text-[color:var(--muted)]">{description}</p>}
      <p className="mt-auto pt-4 text-[11px] leading-4 text-[color:var(--muted)]">{meta}</p>
    </Link>
  </li>
);

export const ProjectCard = ({project, folderName}: {project: Project, folderName?: string}) => (
  <Card
    to={"/project/" + project.id}
    name={project.name}
    description={project.description}
    meta={<>
      {folderName && <span className="block truncate">{folderName}</span>}
      <span className="tabular-nums">{counted(Object.keys(project.documents ?? {}).length, "document", "documents")}</span>
      {" · " + getActivityLabel(project)}
    </>}
  />
);

export const FolderCard = ({folder}: {folder: Folder}) => (
  <Card
    to={"/folder/" + folder.id}
    name={folder.name}
    description={folder.description}
    meta={<>
      <span className="tabular-nums">{counted(Object.keys(folder.projects ?? {}).length, "project", "projects")}</span>
      {" · " + getActivityLabel(folder)}
    </>}
  />
);

// the dashed card that closes a grid and starts something new
export const NewCard = ({label, onClick}: {label: string, onClick: () => void}) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-[color:var(--hair-strong)] text-[12.5px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--ui)] focus-visible:!rounded-[8px] active:bg-[color:var(--tint)]"
    >
      <StrokeIcon name="plus" size={18} />
      {label}
    </button>
  </li>
);

// every row takes the tallest card's height, so a New card on its own row matches the rest
export const cardGrid = "grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3";
