import { describe, expect, it } from "vitest";
import { KEEP_ALL_FOR_MS, MAX_VERSIONS, VersionEntry, Versions, describeVersion, scriptHash, versionsToDrop, worthKeeping } from "./history";
import { ElementType, ScriptBlock } from "./types";

const block = (id: string, type: ElementType, text: string): ScriptBlock => ({id, type, text});
const script = [block("h", "heading", "INT. HOUSE - DAY"), block("a", "action", "She waits by the door.")];
const entry = (savedAt: number, hash = "x"): VersionEntry => ({savedAt, hash, pages: 1, words: 1});

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
// noon, so a few hours either way stays on the same day
const NOW = new Date(2026, 10, 27, 12).getTime();

describe("scriptHash", () => {
  it("ignores block ids", () => {
    expect(scriptHash(script)).toBe(scriptHash(script.map((b, i) => ({...b, id: "new" + i}))));
  });

  it("changes with a word or an element", () => {
    expect(scriptHash(script)).not.toBe(scriptHash([script[0], {...script[1], text: "She waits."}]));
    expect(scriptHash(script)).not.toBe(scriptHash([script[0], {...script[1], type: "dialogue"}]));
  });
});

describe("describeVersion", () => {
  it("counts the copy's pages and words", () => {
    expect(describeVersion(script, NOW)).toEqual({savedAt: NOW, hash: scriptHash(script), pages: 1, words: 9});
  });
});

describe("worthKeeping", () => {
  it("keeps a first version", () => {
    expect(worthKeeping({}, script)).toBe(true);
  });

  it("skips an empty script", () => {
    expect(worthKeeping({}, [block("a", "action", " ")])).toBe(false);
  });

  it("skips a copy the newest version already holds, but not an older one", () => {
    const hash = scriptHash(script);
    expect(worthKeeping({a: entry(NOW - HOUR, "other"), b: entry(NOW, hash)}, script)).toBe(false);
    expect(worthKeeping({a: entry(NOW - HOUR, hash), b: entry(NOW, "other")}, script)).toBe(true);
  });
});

describe("versionsToDrop", () => {
  it("keeps everything from the last two days", () => {
    const versions: Versions = {a: entry(NOW), b: entry(NOW - HOUR), c: entry(NOW - KEEP_ALL_FOR_MS + HOUR)};
    expect(versionsToDrop(versions, NOW)).toEqual([]);
  });

  it("keeps only the newest of each earlier day", () => {
    const versions: Versions = {
      late: entry(NOW - 5 * DAY + HOUR),
      early: entry(NOW - 5 * DAY - HOUR),
      other: entry(NOW - 6 * DAY),
    };
    expect(versionsToDrop(versions, NOW)).toEqual(["early"]);
  });

  it("drops the oldest beyond the limit", () => {
    const versions: Versions = Object.fromEntries(
      Array.from({length: MAX_VERSIONS + 2}, (_, i) => ["v" + i, entry(NOW - i * 60 * 1000)]),
    );
    expect(versionsToDrop(versions, NOW)).toEqual(["v" + MAX_VERSIONS, "v" + (MAX_VERSIONS + 1)]);
  });
});
