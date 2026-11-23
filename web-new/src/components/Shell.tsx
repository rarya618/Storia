import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useMatch, useOutlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../screenplay/world.css";

// how long the outgoing screen takes to fade; matches .sw-leave in world.css
const LEAVE_MS = 120;

type ShellProps = {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void,
}

// the signed-in frame for home, folders and projects: the rail stays mounted
// across them, and the outgoing screen fades before the next one settles in
const Shell = ({isSidebarVisible, toggleSidebarVisible}: ShellProps) => {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const folderMatch = useMatch("/folder/:id");
  const projectMatch = useMatch("/project/:id");
  // the rail marks where the writer is going straight away, not after the fade
  const current = folderMatch?.params.id ?? projectMatch?.params.id;

  // the path on screen lags the real one while the old screen fades out
  const [shownPath, setShownPath] = useState(pathname);
  const leaving = shownPath !== pathname;
  const latestPath = useRef(pathname);
  latestPath.current = pathname;
  // the last screen rendered at rest, held still for its fade
  const steadyOutlet = useRef(outlet);
  if (!leaving) steadyOutlet.current = outlet;

  useEffect(() => {
    if (!leaving) return;
    // further clicks during the fade land on the newest path
    const timer = setTimeout(() => setShownPath(latestPath.current), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  if (!sessionStorage.getItem("Auth Token")) {
    return <Navigate to="/" />
  }

  return (
    <div className="sw sw-rev flex h-screen w-screen">
      <Sidebar current={current} isSidebarVisible={isSidebarVisible} toggleSidebarVisible={toggleSidebarVisible} />
      <div className={"flex min-w-0 flex-1" + (leaving ? " sw-leave pointer-events-none" : "")} aria-busy={leaving || undefined}>
        {leaving ? steadyOutlet.current : outlet}
      </div>
    </div>
  );
};

export default Shell;
