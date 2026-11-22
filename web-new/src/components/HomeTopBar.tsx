import { useEffect, useRef } from "react"
import { faBars, faEllipsisV, faSearch } from "@fortawesome/free-solid-svg-icons"
import { shadowedWhiteColor } from "../styles/colors"
import HeaderButton from "./HeaderButton"
import Menu, { MenuItem } from "./Menu"
import { User } from "../datatypes/User"

// list of dot menu items (not built yet, so shown as coming soon)
const dotMenuItems: MenuItem[][] = [
  [
    {text: "Import", soon: true},
    {text: "Bookmarks", soon: true},
    {text: "Deleted", soon: true}
  ],
  [
    {text: "List view", soon: true}
  ],
  [
    {text: "Comments", soon: true},
    {text: "Statistics", soon: true},
  ],
]

export const topStyle = "flex h-11 shrink-0 items-center px-4 sticky top-0 z-30 my-0";

const HomeTopBar = ({
  isDotMenuVisible,
  toggleDotMenu,
  userData,
  toggleSettings,
  isSidebarVisible,
  toggleSidebarVisible}: {
  isDotMenuVisible: boolean,
  toggleDotMenu: () => void,
  userData: User | undefined,
  toggleSettings: () => void,
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // close the dot menu on an outside click or Escape
    useEffect(() => {
      if (!isDotMenuVisible) return;

      const onPointerDown = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) toggleDotMenu();
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") toggleDotMenu();
      };

      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("mousedown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [isDotMenuVisible, toggleDotMenu]);

    return (
      <div className={shadowedWhiteColor + " " + topStyle}> {/* main view top */}
        {!isSidebarVisible ? <HeaderButton icon={faBars} label="Show sidebar" onClick={toggleSidebarVisible} /> : null}
        <div className="flex-grow"></div>
        <HeaderButton icon={faSearch} label="Search (coming soon)" disabled />
        <div ref={menuRef}> {/* dot menu */}
          <HeaderButton icon={faEllipsisV} label="More" onClick={toggleDotMenu} expanded={isDotMenuVisible} />
          { isDotMenuVisible ?
            <Menu
              menuItemsArray={dotMenuItems}
              isDotMenu={true}
              userData={userData}
              toggleSettings={toggleSettings}
              onClose={toggleDotMenu}
            />
            : null}
        </div>
      </div>
    )
}

export default HomeTopBar
