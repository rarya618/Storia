// "ALLEY BEHIND THE CLUB" -> "Alley Behind The Club"; headings and cues are stored in capitals
export const titleCase = (text: string) =>
  text.toLowerCase().replace(/(^|[\s\-/'(])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase());
