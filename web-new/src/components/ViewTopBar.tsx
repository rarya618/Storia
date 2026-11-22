import { ReactNode } from "react";
import { faBars, faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderButton from "./HeaderButton";
import { shadowedWhiteColor } from "../styles/colors";
import { topStyle } from "./HomeTopBar";

type ViewTopBarProps = {
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void,
  backTo: string,
  backLabel: string,
  breadcrumb: ReactNode,
  activity: string,
  children?: ReactNode,
}

// top bar for Folder and Project views
const ViewTopBar = (props: ViewTopBarProps) => {
  return (
    <div className={shadowedWhiteColor + " " + topStyle + " select-none gap-1"}>
      {!props.isSidebarVisible && (
        <HeaderButton icon={faBars} label="Show sidebar" onClick={props.toggleSidebarVisible} />
      )}
      <HeaderButton icon={faCaretLeft} label={props.backLabel} to={props.backTo} />
      <nav aria-label="Breadcrumb" className="ml-2 min-w-0 truncate text-sm text-purple">
        {props.breadcrumb}
      </nav>
      <div className="flex-grow" />
      <p className="hidden sm:block mx-2 shrink-0 text-xs text-neutral-500 dark:text-neutral-400">{props.activity}</p>
      {props.children}
    </div>
  )
}

export default ViewTopBar;
