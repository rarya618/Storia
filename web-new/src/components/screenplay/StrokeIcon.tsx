// the world's icons: drawn in the same 1px-ish ink stroke as its hairlines
const PATHS = {
  back: "M14 6 L8 12 L14 18 M8 12 H20",
  menu: "M4 7 H20 M4 12 H20 M4 17 H20",
};

const StrokeIcon = ({name}: {name: keyof typeof PATHS}) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" aria-hidden="true">
    <path d={PATHS[name]} />
  </svg>
);

export default StrokeIcon;
