import { ReactNode } from "react";

// a screen's 64px bar: what starts it at the left, the breadcrumb, the
// screen's actions at the right. While the left rail is hidden the bar starts
// with the show-rail button and the wordmark, and the breadcrumb sits at the
// bar's centre: the two sides share what's left equally, so it's at the true
// centre whenever it fits, and gives way before the buttons do. With the rail
// open there's nothing at the start, and the breadcrumb sits at the left,
// beside the rail
const Bar = ({start, middle, end, className = ""}: {start?: ReactNode, middle: ReactNode, end?: ReactNode, className?: string}) => {
  const centred = Boolean(start);
  return (
    <header className={"sw-bar h-16 shrink-0 px-[14px] " + (centred ? "" : "is-start ") + className}>
      {centred && <div className="flex items-center gap-2">{start}</div>}
      <div className={"flex min-w-0 items-center gap-2" + (centred ? " justify-center" : "")}>{middle}</div>
      <div className="flex items-center justify-end gap-2">{end}</div>
    </header>
  );
};

export default Bar;
