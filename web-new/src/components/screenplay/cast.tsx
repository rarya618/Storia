import { CodeColour } from "../../screenplay/structure";

// "ALLEY BEHIND THE CLUB" -> "Alley Behind The Club"; headings and cues are stored in capitals
export const titleCase = (text: string) =>
  text.toLowerCase().replace(/(^|[\s\-/'(])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase());

// a character's colour code: two small muted blocks, always shown beside the name
export const CastCode = ({code}: {code?: [CodeColour, CodeColour]}) => (
  <span className="sw-code" aria-hidden="true">
    <i className={code?.[0] ?? "white"} /><i className={code?.[1] ?? "white"} />
  </span>
);
