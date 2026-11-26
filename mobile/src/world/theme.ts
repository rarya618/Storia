import { StyleSheet, TextStyle } from "react-native";

// Revision Pages, web-new's world (web-new/DESIGN.md, the tokens in
// screenplay/world.css), on the phone: ink on white, a warm neutral rail, and
// the revision papers as the only colour. Keep these in step with world.css.

export const colours = {
  // text, the primary button, focus and "this one"
  ink: "#1B1B1F",
  inkHover: "#3A3A40",
  // secondary text, meta, placeholders and icons at rest; 7.4:1 on white
  muted: "#57534E",
  paper: "#FFFFFF",
  // the rail's ground, and one step darker for its pressed rows and the segmented track
  rail: "#F3F1EC",
  railHover: "#E9E5DE",
  // pressed fills and loading slabs
  tint: "#F7F5F1",
  wash: "#EFEBE4",
  hair: "#E6E1D8",
  // button and input borders
  hairStrong: "#CFC8BC",
  // errors only, such as a failed save
  signal: "#B5473C",
  selection: "rgba(143, 182, 234, 0.4)",
};

// Figtree for the interface, Courier Prime for the script; both are embedded by
// expo-font (app.json), so their weights resolve by family on both platforms
export const fonts = {ui: "Figtree", script: "Courier Prime"};

// Tailwind's standard sizes, as the web sets the interface; text-sm is the floor
const size = (fontSize: number, lineHeight: number, letterSpacing = 0): TextStyle =>
  ({fontFamily: fonts.ui, fontSize, lineHeight, letterSpacing, color: colours.ink});

export const type = StyleSheet.create({
  wordmark: {...size(24, 24, -0.48), fontWeight: "800"},
  display: {...size(30, 36, -0.75), fontWeight: "700"},
  heading: {...size(24, 32, -0.6), fontWeight: "700"},
  section: {...size(18, 28), fontWeight: "700"},
  title: {...size(18, 24, -0.45), fontWeight: "600"},
  body: {...size(16, 24), fontWeight: "400"},
  label: {...size(14, 20), fontWeight: "700"},
  small: {...size(14, 20), fontWeight: "400"},
  control: {...size(14, 20), fontWeight: "700"},
  meta: {...size(12, 16), fontWeight: "400", color: colours.muted, fontVariant: ["tabular-nums"]},
});

// the script, as web-new drafts it on a phone (world.css, under 640px): 13px
// Courier Prime at the page's 1.2 line, edge to edge with roomier indents
export const script = {
  font: fonts.script,
  size: 13,
  lineHeight: 13 * 1.2,
};

// the world's shadows, which belong to paper
export const shadows = StyleSheet.create({
  // the rail's current row, and the selected segment
  slip: {
    boxShadow: [
      {offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: 1, color: colours.hair},
      {offsetX: 0, offsetY: 1, blurRadius: 2, color: "rgba(27, 27, 31, 0.06)"},
    ],
  },
  // a sheet at rest
  sheet: {boxShadow: [{offsetX: 0, offsetY: 1, blurRadius: 3, color: "rgba(27, 27, 31, 0.08)"}]},
  // the drafts fanned under the top sheet
  under: {
    boxShadow: [
      {offsetX: 0, offsetY: 1, blurRadius: 2, color: "rgba(27, 27, 31, 0.08)"},
      {offsetX: 0, offsetY: 4, blurRadius: 10, color: "rgba(27, 27, 31, 0.06)"},
    ],
  },
});

// corners, as the web's: rows 6, controls and sheets 8, cards 10, bars 12
export const radii = {strip: 3, row: 6, control: 8, card: 10, bar: 12, full: 9999};
