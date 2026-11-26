import { ReactNode } from "react";

// the page's own heading at the top of the content: the name large, what it
// holds or when it last moved beneath, then the writer's description
const PageHeading = ({title, meta, description}: {title: string, meta: ReactNode, description?: string}) => (
  <div className="mb-10">
    <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
    <p className="mt-2 text-base text-[color:var(--muted)]">{meta}</p>
    {description && <p className="mt-4 max-w-[65ch] break-words text-base">{description}</p>}
  </div>
);

export default PageHeading;
