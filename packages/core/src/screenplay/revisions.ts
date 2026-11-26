// the colours a production prints each round of script changes on, in order.
// Storia gives each draft in a project the next colour, by when it was made,
// so writers learn the ritual by using it.
export type Revision = {name: string, color: string, edge: string};

export const REVISIONS: Revision[] = [
  {name: "White", color: "#FFFFFF", edge: "#D9D4CB"},
  {name: "Blue", color: "#CFE3FF", edge: "#8FB6EA"},
  {name: "Pink", color: "#FFD3E0", edge: "#E99BB3"},
  {name: "Yellow", color: "#FFF1A8", edge: "#DCC64E"},
  {name: "Green", color: "#CDEFC4", edge: "#8CCB7C"},
  {name: "Goldenrod", color: "#F5C451", edge: "#C9962A"},
  {name: "Buff", color: "#F0DDB8", edge: "#CDB07A"},
  {name: "Salmon", color: "#FFC2AD", edge: "#E68E70"},
  {name: "Cherry", color: "#F7A1B0", edge: "#D86479"},
];

// the nth draft's colour (0 is the first draft); past cherry the cycle starts again
export const revisionAt = (index: number) => REVISIONS[((index % REVISIONS.length) + REVISIONS.length) % REVISIONS.length];

// the first n colours of the sequence, for a band that shows how many drafts a project holds
export const revisionBand = (count: number) => Array.from({length: Math.min(count, REVISIONS.length)}, (_, index) => REVISIONS[index]);

type Made = {id: string, createdOn?: string};

// drafts in the order they were made, oldest first; dates are Date.toString() text, so compare as times
export const inDraftOrder = <T extends Made>(drafts: T[]) =>
  [...drafts].sort((a, b) => ((Date.parse(a.createdOn ?? "") || 0) - (Date.parse(b.createdOn ?? "") || 0)) || a.id.localeCompare(b.id));

// "1st", "2nd", "3rd", "4th"…
export const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return n + "th";
  return n + (["th", "st", "nd", "rd"][n % 10] ?? "th");
};
