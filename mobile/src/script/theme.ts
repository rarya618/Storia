import { Platform } from "react-native";

// web-new's world tokens (screenplay/world.css): ink on white paper, with the
// rail's warm tints for the interface around the script
export const colours = {
  ink: "#1B1B1F",
  muted: "#57534E",
  faint: "#A8A29E",
  rail: "#F3F1EC",
  tint: "#F7F5F1",
  wash: "#EFEBE4",
  hair: "#E6E1D8",
  paper: "#FFFFFF",
  // errors only, such as a failed save
  signal: "#B5473C",
};

// the script in Courier, as on paper; Android's monospace stands in for it
export const script = {
  font: Platform.select({ios: "Courier", android: "monospace", default: "Courier New"}),
  size: 16,
  lineHeight: 22,
};
