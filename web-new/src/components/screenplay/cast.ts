// Headings and cues are stored in capitals; outside the script they read in title case:
// "ALLEY BEHIND THE CLUB" -> "Alley Behind The Club", "MARA'S FLAT" -> "Mara's Flat".
// Acronyms stay in capitals (common ones listed, plus any word with no vowels and
// Roman numerals), and text the writer typed in mixed case ("McGregor") is left as typed.
const ACRONYMS = new Set(["FBI", "CIA", "NSA", "NYPD", "LAPD", "NYC", "LA", "UK", "USA", "UN", "EU", "HQ", "ER", "ICU", "DMV", "CEO", "CCTV", "TV", "DJ", "ATM", "BBC", "NASA", "MRI", "ID", "AI", "VIP", "SUV", "RV", "DA", "EMT", "SWAT", "POV", "VO", "OC"]);
const isAcronym = (letters: string) =>
  ACRONYMS.has(letters) || /^[IVXLC]+$/.test(letters) || (letters.length > 1 && !/[AEIOUY]/.test(letters));
const titleWord = (word: string) =>
  word.toLowerCase()
    .replace(/(^|[-/'(])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase())
    .replace(/'S(?=$|[^\p{L}])/gu, "'s");

export const titleCase = (text: string) => {
  if (/\p{Ll}/u.test(text)) return text;
  return text.split(/(\s+)/).map(word => {
    const letters = word.replace(/[^\p{L}]/gu, "");
    return letters.length > 1 && isAcronym(letters) ? word : titleWord(word);
  }).join("");
};
