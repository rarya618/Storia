// the world's icons: drawn in one light ink stroke
const PATHS = {
  back: "M14 6 L8 12 L14 18",
  menu: "M4 7 H20 M4 12 H20 M4 17 H20",
  collapseLeft: "M12 7 L7 12 L12 17 M18 7 L13 12 L18 17",
  collapseRight: "M6 7 L11 12 L6 17 M12 7 L17 12 L12 17",
  panelLeft: "M4 5 H20 V19 H4 Z M9.5 5 V19",
  panelRight: "M4 5 H20 V19 H4 Z M14.5 5 V19",
  dots: "M12 6 V6.01 M12 12 V12.01 M12 18 V18.01",
  plus: "M12 6 V18 M6 12 H18",
  pencil: "M5 19 L5.6 15.6 L15.4 5.8 A1.5 1.5 0 0 1 17.5 5.8 L18.2 6.5 A1.5 1.5 0 0 1 18.2 8.6 L8.4 18.4 Z M13.8 7.4 L16.6 10.2",
  chevronRight: "M10 7 L15 12 L10 17",
  chevronDown: "M7 10 L12 15 L17 10",
  search: "M10.5 5 A5.5 5.5 0 1 0 10.5 16 A5.5 5.5 0 1 0 10.5 5 Z M14.5 14.5 L19 19",
  close: "M7 7 L17 17 M17 7 L7 17",
  folder: "M4 6.5 H9.5 L11.5 8.5 H20 V18 H4 Z",
  cast:"M9 5.5 A3 3 0 1 0 9 11.5 A3 3 0 1 0 9 5.5 Z M3.5 18.5 C3.5 15.5 6 14 9 14 C12 14 14.5 15.5 14.5 18.5 M15.5 5.7 A3 3 0 0 1 15.5 11.3 M17 14.2 C19 14.7 20.5 16 20.5 18.5",
};

const StrokeIcon = ({name, size = 18}: {name: keyof typeof PATHS, size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "dots" ? 2.4 : 1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[name]} />
  </svg>
);

export default StrokeIcon;
