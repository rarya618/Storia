import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Folder, Project } from "../datatypes/Block";
import { getActivityLabel } from "../misc/date";
import { revisionBand } from "../screenplay/revisions";
import StrokeIcon from "./screenplay/StrokeIcon";

// "5 documents" with the number leading, or "No documents"
export const Counted = ({count, one, many}: {count: number, one: string, many: string}) =>
  count === 0
    ? <>No {many}</>
    : <><span className="sw-fig">{count}</span> {count === 1 ? one : many}</>;

// the band along a project card's top edge: one stripe per document in
// revision colours, or one plain stripe when it has none
const Band = ({colors}: {colors: string[]}) => (
  <span className="sw-band" aria-hidden="true">
    {colors.map((color, index) => <i key={index} style={{background: color}} />)}
  </span>
);

// a card: the band, the name, what it's about, and a ruled foot pinned to the bottom
// with onEdit, a pencil sits in the top corner, beside the link rather than in it
const Card = ({to, band, name, description, place, count, activity, onEdit}: {to: string, band?: string[], name: string, description?: string, place?: ReactNode, count: ReactNode, activity: string, onEdit?: () => void}) => (
  <li className={"flex" + (onEdit ? " sw-editable relative" : "")}>
    {onEdit && (
      <button type="button" onClick={onEdit} className="sw-icon sw-edit absolute right-2.5 top-3.5 z-10" aria-label={"Edit " + name} title="Edit details">
        <StrokeIcon name="pencil" size={16} />
      </button>
    )}
    <Link to={to} className="sw-card flex-1 overflow-hidden">
      {band && <Band colors={band} />}
      <div className="flex flex-1 flex-col px-4 pb-3.5 pt-3.5">
        <h3 title={name} className={"sw-card-name line-clamp-2 text-lg leading-6" + (onEdit ? " pr-10" : "")}>{name}</h3>
        {description && <p className="mt-1 line-clamp-2 break-words text-sm text-[color:var(--muted)]">{description}</p>}
        <div className="min-h-4 flex-1" aria-hidden="true" />
        <div className="sw-card-foot text-sm">
          {place}
          {/* the count and the activity each wrap whole, never leaving a word behind */}
          <p className="flex flex-wrap justify-between gap-x-3">
            <span className="whitespace-nowrap">{count}</span>
            <span className="whitespace-nowrap">{activity}</span>
          </p>
        </div>
      </div>
    </Link>
  </li>
);

const Place = ({children}: {children: ReactNode}) => (
  <p className="sw-card-place">
    <StrokeIcon name="folder" size={15} />
    <span>{children}</span>
  </p>
);

// one revision colour per document, in the order a production would print them
const documentBand = (count: number) =>
  count === 0 ? ["var(--wash)"] : revisionBand(count).map(revision => revision.color);

// home names every project's folder, "No folder" included; the folder page names none
export const ProjectCard = ({project, folderName, onEdit}: {project: Project, folderName?: string | null, onEdit?: () => void}) => {
  const documents = Object.keys(project.documents ?? {}).length;
  return (
    <Card
      to={"/project/" + project.id}
      band={documentBand(documents)}
      name={project.name}
      description={project.description}
      place={folderName !== undefined && <Place>{folderName ?? "No folder"}</Place>}
      count={<Counted count={documents} one="document" many="documents" />}
      activity={getActivityLabel(project)}
      onEdit={onEdit}
    />
  );
};

export const FolderCard = ({folder, onEdit}: {folder: Folder, onEdit?: () => void}) => {
  const names = Object.values(folder.projects ?? {}).map(project => project?.name).filter(Boolean);
  return (
    <Card
      to={"/folder/" + folder.id}
      name={folder.name}
      description={folder.description}
      place={names.length > 0 && <p className="truncate text-[color:var(--ui)]" title={names.join(", ")}>{names.join(", ")}</p>}
      count={<Counted count={names.length} one="project" many="projects" />}
      activity={getActivityLabel(folder)}
      onEdit={onEdit}
    />
  );
};

// the dashed card that closes a grid and starts something new
export const NewCard = ({label, onClick}: {label: string, onClick: () => void}) => (
  <li className="flex">
    <button type="button" onClick={onClick} className="sw-card-new min-h-[120px] text-base">
      <StrokeIcon name="plus" size={18} />
      {label}
    </button>
  </li>
);

// cards in a row share its tallest card's height; rows without descriptions stay short
export const cardGrid = "grid grid-cols-[repeat(auto-fill,minmax(256px,1fr))] gap-4";
