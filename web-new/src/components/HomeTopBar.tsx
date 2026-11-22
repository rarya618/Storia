import { faBars, faEllipsisV, faSearch } from "@fortawesome/free-solid-svg-icons"
import { shadowedWhiteColor } from "../styles/colors"
import HeaderButton from "./HeaderButton"
import Menu, { MenuItem } from "./Menu"
import { User } from "../datatypes/User"

// list of dot menu items
const dotMenuItems: MenuItem[][] = [
  [
    {text: "Import"},
    {text: "Bookmarks", link: "/bookmarks"},
    {text: "Deleted", link: "/deleted"}
  ],
  [
    {text: "List view"}
  ],
  [
    {text: "Comments", link: "/comments"},
    {text: "Statistics", link: "/statistics"},
  ],
]

export const topStyle = "flex h-11 items-center px-4 sticky top-0 z-0 my-0";

const HomeTopBar = ({
  isDotMenuVisible, 
  toggleDotMenu, 
  userData, 
  isSettingsVisible,
  toggleSettings,
  isSidebarVisible,
  toggleSidebarVisible}: {
  isDotMenuVisible: boolean, 
  toggleDotMenu: () => void, 
  userData: User | undefined,
  isSettingsVisible: boolean,
  toggleSettings: () => void,
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void}) => {
    return (
      <div className={shadowedWhiteColor + " " + topStyle}> {/* main view top */}
        <div className="my-auto"> {/* sidebar icon */}
          {!isSidebarVisible ? <HeaderButton icon={faBars} onClick={toggleSidebarVisible} /> : null}
        </div>
        <div className="flex-grow"></div>
        <div className="my-1"> {/* dot menu */}
          <HeaderButton icon={faSearch} />
        </div>
        <div className="my-1"> {/* dot menu */}
          <HeaderButton icon={faEllipsisV} onClick={toggleDotMenu} />
          { isDotMenuVisible ? 
            <Menu 
              menuItemsArray={dotMenuItems} 
              isDotMenu={true} 
              userData={userData} 
              toggleSettings={toggleSettings}
            /> 
            : null /* dot menu */}
        </div>
      </div>
    )
}

export default HomeTopBar