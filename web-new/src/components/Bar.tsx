import { ReactNode, useLayoutEffect, useRef } from "react";

// the rail's own drawer timing (.sw-drawer in world.css): it opens over 260ms
// and shuts over 200ms, so the breadcrumb travels with it
const OPENING = {duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)"};
const SHUTTING = {duration: 200, easing: "cubic-bezier(0.32, 0, 0.67, 0)"};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// a screen's 64px bar: what starts it at the left, the breadcrumb, the
// screen's actions at the right. While the left rail is hidden the bar starts
// with the show-rail button and the wordmark, and the breadcrumb sits at the
// bar's centre: the two sides share what's left equally, so it's at the true
// centre whenever it fits, and gives way before the buttons do. With the rail
// open there's nothing at the start, and the breadcrumb sits at the left,
// beside the rail. Between the two it slides, in step with the rail
const Bar = ({start, middle, end, className = ""}: {start?: ReactNode, middle: ReactNode, end?: ReactNode, className?: string}) => {
  const centred = Boolean(start);
  const barRef = useRef<HTMLElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const wasCentred = useRef(centred);

  // where the breadcrumb sat in the bar before this change of place, read
  // during the render that makes it (the page is still drawn the old way then),
  // and only then, so typing in the editor never pays for a measurement
  const before = useRef<number>();
  if (wasCentred.current !== centred && barRef.current && trailRef.current) {
    before.current = trailRef.current.getBoundingClientRect().left - barRef.current.getBoundingClientRect().left;
  }

  useLayoutEffect(() => {
    if (wasCentred.current === centred) return;
    wasCentred.current = centred;
    const from = before.current;
    before.current = undefined;
    const bar = barRef.current, trail = trailRef.current;
    if (from === undefined || !bar || !trail || reducedMotion()) return;
    const shift = from - (trail.getBoundingClientRect().left - bar.getBoundingClientRect().left);
    if (Math.abs(shift) < 1) return;
    // the rail shutting is what centres it, and opening is what sends it left
    trail.animate([{transform: `translateX(${shift}px)`}, {transform: "none"}], centred ? SHUTTING : OPENING);
  }, [centred]);

  return (
    <header ref={barRef} className={"sw-bar h-16 shrink-0 px-[14px] " + (centred ? "" : "is-start ") + className}>
      {centred && <div className="sw-bar-start flex items-center gap-2">{start}</div>}
      <div className={"flex min-w-0 items-center" + (centred ? " justify-center" : "")}>
        <div ref={trailRef} className="flex min-w-0 items-center gap-2">{middle}</div>
      </div>
      <div className="flex items-center justify-end gap-2">{end}</div>
    </header>
  );
};

export default Bar;
