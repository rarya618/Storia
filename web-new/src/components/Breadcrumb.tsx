import { ReactNode } from "react";
import { Link } from "react-router-dom";
import StrokeIcon from "./screenplay/StrokeIcon";

export type Crumb = { label: string, to: string };

const Separator = () => (
  <span className="shrink-0 text-[color:var(--muted)]" aria-hidden="true">
    <StrokeIcon name="chevronRight" size={14} />
  </span>
);

// where this page sits: each place above it as a quiet link, then the page
// itself in ink. On phones only the nearest place above stays, so the trail
// still leads back up without crowding the bar.
const Breadcrumb = ({trail, current}: {trail: Crumb[], current: ReactNode}) => (
  <nav aria-label="Breadcrumb" className="min-w-0">
    <ol className="flex min-w-0 items-center gap-0.5 text-sm">
      {trail.map((crumb, index) => {
        const nearest = index === trail.length - 1;
        return (
          <li key={crumb.to} className={"flex min-w-0 items-center gap-0.5" + (nearest ? "" : " max-sm:hidden")}>
            <Link
              to={crumb.to}
              className="max-w-[14rem] truncate rounded-md px-1.5 py-1 text-[color:var(--muted)] transition-colors duration-[120ms] hover:bg-[color:var(--wash)] hover:text-[color:var(--ui)]"
            >
              {crumb.label}
            </Link>
            <Separator />
          </li>
        );
      })}
      <li className="flex min-w-0 items-center px-1.5" aria-current="page">{current}</li>
    </ol>
  </nav>
);

export default Breadcrumb;
