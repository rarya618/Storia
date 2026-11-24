import { ordinal, revisionAt, revisionStyle } from "../screenplay/revisions";

// a draft's place in its project ("2nd draft"), on the paper a production
// would print it on; the industry name ("Blue pages") is there on hover for
// writers who know the ritual
const RevisionChip = ({position, className = ""}: {position: number, className?: string}) => {
  const revision = revisionAt(position);
  return (
    <span className={"sw-rev-chip " + className} style={revisionStyle(revision)} title={revision.name + " pages"}>
      {ordinal(position + 1)} draft
    </span>
  );
};

export default RevisionChip;
