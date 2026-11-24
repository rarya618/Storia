import { ReactNode } from "react";

// a screen's 64px bar: what starts it at the left (the show-rail button and
// wordmark), the breadcrumb in the centre, the screen's actions at the right.
// The two sides share what's left equally, so the middle sits at the bar's
// true centre whenever it fits; when it doesn't, the sides keep their buttons
// whole and the breadcrumb gives way
const Bar = ({start, middle, end, className = ""}: {start?: ReactNode, middle: ReactNode, end?: ReactNode, className?: string}) => (
  <header className={"sw-bar h-16 shrink-0 px-[14px] " + className}>
    <div className="flex items-center gap-2">{start}</div>
    <div className="flex min-w-0 items-center justify-center gap-2">{middle}</div>
    <div className="flex items-center justify-end gap-2">{end}</div>
  </header>
);

export default Bar;
