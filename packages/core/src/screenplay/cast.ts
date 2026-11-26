// Headings, cues and act breaks print in capitals; outside the script they read in
// title case, the way a book title is set: "BACK OF THE VAN" -> "Back of the Van",
// "MR. HENDERSON'S OFFICE" -> "Mr. Henderson's Office".
//
// - Small words (of, the, a, and…) stay lower case, except at the start or end of
//   a phrase, where a phrase also starts after " - ", "/", ":" or "(".
// - Acronyms stay in capitals: the common ones listed, any word with no vowels that
//   isn't a known abbreviation (Mr, Dr, St…), and Roman numerals up to XXXIX.
// - Names keep their inner capitals: O'Brien, D'Angelo, McGregor, Jean-Luc.
// - Contractions and ordinals don't: Don't, Joe's, 5th.
const ACRONYMS = new Set(["FBI", "CIA", "NSA", "NYPD", "LAPD", "NYC", "LA", "UK", "USA", "UN", "EU", "HQ", "ER", "ICU", "DMV", "CEO", "CCTV", "TV", "DJ", "ATM", "BBC", "NASA", "MRI", "ID", "AI", "VIP", "SUV", "RV", "DA", "EMT", "SWAT", "POV", "VO", "OC"]);
// abbreviations with no vowels that are words, not acronyms
const ABBREVIATIONS = new Set(["MR", "MRS", "MS", "DR", "ST", "JR", "SR", "MT", "FT", "RD", "LN", "BLVD", "BLDG", "LT", "SGT", "CPL", "PVT", "CPT", "PKWY"]);
const SMALL_WORDS = new Set(["A", "AN", "THE", "AND", "BUT", "OR", "NOR", "OF", "IN", "ON", "AT", "TO", "BY", "FOR", "FROM", "WITH", "AS", "VS", "VIA", "INTO", "ONTO"]);
const ROMAN = /^X{0,3}(IX|IV|V?I{0,3})$/;

const isAcronym = (letters: string) =>
  ACRONYMS.has(letters) || ROMAN.test(letters) || (!ABBREVIATIONS.has(letters) && !/[AEIOUY]/.test(letters));

const titleWord = (word: string) =>
  word.toLowerCase()
    // the first letter, and the first after a hyphen, slash or bracket
    .replace(/(^|[-/(])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase())
    // a one-letter prefix before an apostrophe: O'Brien, D'Angelo
    .replace(/^(\p{L})'(\p{L})/u, (_, prefix, letter) => prefix.toUpperCase() + "'" + letter.toUpperCase())
    // McGregor, McDonald's
    .replace(/(^|[-/(])Mc(\p{L})/gu, (_, gap, letter) => gap + "Mc" + letter.toUpperCase());

// a phrase starts at the beginning, and after a separator
const opensPhrase = (word: string) => /^[-–—/:]$/.test(word) || /[:(]$/.test(word);

export const titleCase = (text: string) => {
  const parts = text.toUpperCase().split(/(\s+)/);
  const words = parts.map((part, index) => ({part, index})).filter(({part}) => /\p{L}/u.test(part));
  const last = words[words.length - 1]?.index;

  let phraseStart = true;
  return parts.map((part, index) => {
    if (/^\s*$/.test(part)) return part;
    const letters = part.replace(/[^\p{L}]/gu, "");
    const starts = phraseStart || part.startsWith("(");
    phraseStart = opensPhrase(part);
    if (!letters) return part.toLowerCase();
    if (letters.length > 1 && isAcronym(letters) && !/\d/.test(part)) return part;
    if (SMALL_WORDS.has(letters) && !starts && index !== last && part === letters) return part.toLowerCase();
    return titleWord(part);
  }).join("");
};

// a scene heading's prefix as the rail's meta column shows it
const PLACES: Record<string, string> = {"INT": "Int", "EXT": "Ext", "EST": "Est", "INT./EXT": "Int/Ext", "INT/EXT": "Int/Ext", "I/E": "Int/Ext"};
export const placeLabel = (place: string) => PLACES[place.toUpperCase()] ?? titleCase(place);
