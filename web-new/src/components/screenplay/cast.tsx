// "ALLEY BEHIND THE CLUB" -> "Alley Behind The Club"; headings and cues are stored in capitals
// (a possessive 's stays lower case: "MARA'S FLAT" -> "Mara's Flat", "O'BRIEN" -> "O'Brien")
export const titleCase = (text: string) =>
  text.toLowerCase()
    .replace(/(^|[\s\-/'(])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase())
    .replace(/'S(?=$|[^\p{L}])/gu, "'s");
