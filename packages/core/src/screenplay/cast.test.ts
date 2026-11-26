import { describe, expect, it } from "vitest";
import { placeLabel, titleCase } from "./cast";

describe("titleCase", () => {
  it.each([
    ["BACK OF THE VAN", "Back of the Van"],
    ["A ROOM WITH A VIEW", "A Room with a View"],
    ["MR. HENDERSON'S OFFICE", "Mr. Henderson's Office"],
    ["DR KIM", "Dr Kim"],
    ["ST. MARY'S HOSPITAL", "St. Mary's Hospital"],
    ["MCDONALD'S", "McDonald's"],
    ["O'BRIEN'S PUB", "O'Brien's Pub"],
    ["D'ANGELO", "D'Angelo"],
    ["DON'T STOP DINER", "Don't Stop Diner"],
    ["CIVIL COURT", "Civil Court"],
    ["LIV", "Liv"],
    ["ROCKY II", "Rocky II"],
    ["WAREHOUSE ON 5TH AVE", "Warehouse on 5th Ave"],
    ["HOUSE - KITCHEN", "House - Kitchen"],
    ["NIGHT (FLASHBACK)", "Night (Flashback)"],
    ["FBI HEADQUARTERS", "FBI Headquarters"],
    ["JEAN-LUC", "Jean-Luc"],
    ["SARAH (V.O.)", "Sarah (V.O.)"],
    ["END OF ACT ONE", "End of Act One"],
    ["act one", "Act One"],
  ])("%s reads as %s", (text, expected) => {
    expect(titleCase(text)).toBe(expected);
  });
});

describe("placeLabel", () => {
  it.each([["INT", "Int"], ["EXT", "Ext"], ["EST", "Est"], ["INT./EXT", "Int/Ext"], ["I/E", "Int/Ext"]])("%s reads as %s", (place, expected) => {
    expect(placeLabel(place)).toBe(expected);
  });
});
