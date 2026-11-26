import { CSSProperties } from "react";
import { Revision } from "@storia/core/screenplay/revisions";

// the revision colours and their order are shared with mobile, in @storia/core
export * from "@storia/core/screenplay/revisions";

// the paper a revision is printed on, as the variables sheets, chips and strips read
export const revisionStyle = (revision?: Revision) =>
  (revision ? {"--sheet-ground": revision.color, "--edge": revision.edge} : {}) as CSSProperties;
