import Svg, { Path } from "react-native-svg";
import { colours } from "./theme";

// the world's icons, drawn in one light ink stroke on a 24px grid: the same
// paths as web's components/screenplay/StrokeIcon.tsx, so keep the two in step
const PATHS = {
  back: "M14 6 L8 12 L14 18",
  chevronRight: "M10 7 L15 12 L10 17",
  dots: "M12 6 V6.01 M12 12 V12.01 M12 18 V18.01",
  close: "M7 7 L17 17 M17 7 L7 17",
  pages: "M8.5 4 H18 V16.5 H8.5 Z M5.5 7.5 V20 H15",
  folder: "M4 6.5 H9.5 L11.5 8.5 H20 V18 H4 Z",
};

export type IconName = keyof typeof PATHS;

export function Icon({name, size = 18, color = colours.ink}: {name: IconName, size?: number, color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path d={PATHS[name]} stroke={color} strokeWidth={name === "dots" ? 2.4 : 1.4}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
