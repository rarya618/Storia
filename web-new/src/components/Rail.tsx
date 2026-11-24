import { CSSProperties, ReactNode } from "react";

type RailProps = {
  side: "left" | "right",
  open: boolean,
  // docked: the rail takes its place beside the page; otherwise it's a drawer over it
  docked: boolean,
  width: number,
  label: string,
  // the scrim's click, for a drawer
  onClose: () => void,
  className?: string,
  // the folder rail is the app's navigation, so it can be a nav landmark
  landmark?: "aside" | "nav",
  children: ReactNode,
};

// A rail that opens and closes like a drawer pulled from the window's edge (the
// folder rail, and the editor's scene and project rails). Docked, its track
// slides open and the page makes room, while the panel inside keeps its full
// width, pinned to the outer edge, so the rail's contents travel with the edge
// rather than squashing or fading. As a drawer, it slides over the page above a
// scrim that fades with it. It stays mounted, so both directions can move, and
// it's inert while shut. Motion lives in world.css (.sw-drawer)
const Rail = ({side, open, docked, width, label, onClose, className = "", landmark = "aside", children}: RailProps) => {
  const Landmark = landmark;
  // React 18 doesn't know inert, so it's passed as a plain attribute
  const shut = open ? {} : {inert: ""} as Record<string, string>;
  const state = (docked ? " is-docked" : " is-overlay") + (open ? " is-open" : "");
  return (
    <>
      {!docked && <div className={"sw-scrim no-print" + (open ? " is-open" : "")} onClick={onClose} aria-hidden="true" />}
      <Landmark
        aria-label={label}
        className={"sw-drawer no-print sw-drawer-" + side + state + " " + className}
        style={{"--rail-w": width + "px"} as CSSProperties}
        {...shut}
      >
        <div className="sw-drawer-panel">{children}</div>
      </Landmark>
    </>
  );
};

export default Rail;
