import { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useRef, useState } from "react";

type RailProps = {
  side: "left" | "right",
  open: boolean,
  // docked: the rail takes its place beside the page; otherwise it's a drawer over it
  docked: boolean,
  // on a phone, a sheet pulled up from the bottom instead of a drawer from the side
  sheet?: boolean,
  width: number,
  label: string,
  // the scrim's click, for a drawer or a sheet
  onClose: () => void,
  className?: string,
  // the folder rail is the app's navigation, so it can be a nav landmark
  landmark?: "aside" | "nav",
  children: ReactNode,
};

// a sheet rests at one of two heights: part way, so the page shows above it, or
// almost the whole screen
const HALF = 0.62;
const TOP_GAP = 16;
type Detent = "half" | "full";

// the part of the window that's showing (what the on-screen keyboard leaves),
// and how far the keyboard pushes the sheet's foot up
const useViewport = (active: boolean) => {
  const read = () => {
    const view = window.visualViewport;
    const height = view?.height ?? window.innerHeight;
    return {height, lift: view ? Math.max(0, window.innerHeight - view.height - view.offsetTop) : 0};
  };
  const [viewport, setViewport] = useState(read);
  useEffect(() => {
    if (!active) return;
    const view = window.visualViewport;
    const onChange = () => setViewport(read());
    onChange();
    view?.addEventListener("resize", onChange);
    view?.addEventListener("scroll", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      view?.removeEventListener("resize", onChange);
      view?.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [active]);
  return viewport;
};

// A rail that opens and closes like a drawer pulled from the window's edge (the
// folder rail, and the editor's scene and project rails). Docked, its track
// slides open and the page makes room, while the panel inside keeps its full
// width, pinned to the outer edge, so the rail's contents travel with the edge
// rather than squashing or fading. As a drawer, it slides over the page above a
// scrim that fades with it. As a sheet, it rises from the bottom to part way up,
// and its handle (or the rail's header, marked sw-sheet-grab) drags it taller,
// shorter or away. It stays mounted, so both directions can move, and it's inert
// while shut. Motion lives in world.css (.sw-drawer)
const Rail = ({side, open, docked, sheet = false, width, label, onClose, className = "", landmark = "aside", children}: RailProps) => {
  const Landmark = landmark;
  const asSheet = sheet && !docked;
  const viewport = useViewport(asSheet && open);
  const [detent, setDetent] = useState<Detent>("half");
  // while a finger is dragging the sheet: the height it's pulled to
  const [dragged, setDragged] = useState<number>();
  const drag = useRef<{start: number, from: number, last: number, at: number, speed: number, moved: boolean}>();
  const railRef = useRef<HTMLElement>(null);
  const suppressTap = useRef(false);

  const full = Math.max(0, viewport.height - TOP_GAP);
  const half = Math.min(full, Math.round(viewport.height * HALF));
  const resting = detent === "full" ? full : half;

  // each opening starts part way up, and takes the keyboard down so the sheet
  // has the screen (the editor keeps its selection, so the caret comes back)
  useEffect(() => {
    if (!asSheet || !open) return;
    setDetent("half");
    const active = document.activeElement;
    if (active instanceof HTMLElement && !railRef.current?.contains(active)) active.blur();
  }, [asSheet, open]);

  const onPointerDown = (event: ReactPointerEvent) => {
    if (!asSheet || event.button !== 0) return;
    const target = event.target as HTMLElement;
    const grab = target.closest(".sw-sheet-grab, .sw-sheet-handle");
    // the header's own buttons and links stay buttons and links
    if (!grab || (target.closest("button, a, input, select, textarea") && !target.closest(".sw-sheet-handle"))) return;
    drag.current = {start: event.clientY, from: resting, last: event.clientY, at: event.timeStamp, speed: 0, moved: false};
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    const current = drag.current;
    if (!current) return;
    const moved = event.clientY - current.start;
    if (!current.moved && Math.abs(moved) < 4) return;
    current.moved = true;
    const elapsed = Math.max(1, event.timeStamp - current.at);
    current.speed = (event.clientY - current.last) / elapsed;
    current.last = event.clientY;
    current.at = event.timeStamp;
    // past the top it gives a little, like a held page
    const pulled = current.from - moved;
    setDragged(pulled > full ? full + (pulled - full) / 4 : Math.max(0, pulled));
  };
  const onPointerUp = () => {
    const current = drag.current;
    drag.current = undefined;
    if (!current?.moved || dragged === undefined) { setDragged(undefined); return; }
    // where it would come to rest, carried on by a flick
    const projected = dragged - current.speed * 220;
    setDragged(undefined);
    if (projected < half * 0.6) onClose();
    else setDetent(projected > (half + full) / 2 ? "full" : "half");
    // the click that ends a drag on the handle isn't a tap
    suppressTap.current = true;
    setTimeout(() => { suppressTap.current = false; }, 0);
  };

  // React 18 doesn't know inert, so it's passed as a plain attribute
  const shut = open ? {} : {inert: ""} as Record<string, string>;
  const state = (asSheet ? " is-sheet" : docked ? " is-docked" : " is-overlay") + (open ? " is-open" : "") + (dragged !== undefined ? " is-dragging" : "");
  const height = dragged ?? resting;
  const style = asSheet
    ? {"--rail-w": width + "px", height: Math.max(height, half) + "px", bottom: viewport.lift + "px", "--sheet-drop": Math.max(0, half - height) + "px"}
    : {"--rail-w": width + "px"};
  return (
    <>
      {!docked && <div className={"sw-scrim" + (open ? " is-open" : "")} onClick={onClose} aria-hidden="true" />}
      <Landmark
        ref={railRef}
        aria-label={label}
        className={"sw-drawer sw-drawer-" + side + state + " " + className}
        style={style as CSSProperties}
        onPointerDown={asSheet ? onPointerDown : undefined}
        onPointerMove={asSheet ? onPointerMove : undefined}
        onPointerUp={asSheet ? onPointerUp : undefined}
        onPointerCancel={asSheet ? onPointerUp : undefined}
        {...shut}
      >
        {asSheet && (
          <button
            type="button"
            className="sw-sheet-handle"
            aria-label={detent === "full" ? "Shrink " + label.toLowerCase() : "Expand " + label.toLowerCase()}
            onClick={() => { if (!suppressTap.current) setDetent(detent === "full" ? "half" : "full"); }}
          />
        )}
        <div className="sw-drawer-panel">{children}</div>
      </Landmark>
    </>
  );
};

export default Rail;
