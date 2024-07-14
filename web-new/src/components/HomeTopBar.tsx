import { faBars, faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { shadowedWhiteColor } from "../styles/colors"
import HeaderButton from "./HeaderButton"
import Menu, { MenuItem } from "./Menu"
import { User } from "../datatypes/User"

// list of dot menu items
const dotMenuItems: MenuItem[][] = [
  [
    {text: "Settings", link: "/settings"}
  ],
  [
    {text: "Log out", link: "/account/logout"}
  ]
]

export const topStyle = "flex h-11 px-4 sticky top-0 z-50";

const HomeTopBar = ({
  isDotMenuVisible, 
  toggleDotMenu, 
  userData, 
  isSidebarVisible,
  toggleSidebarVisible}: {
  isDotMenuVisible: boolean, 
  toggleDotMenu: () => void, 
  userData: User | undefined,
  isSidebarVisible: boolean,
  toggleSidebarVisible: () => void}) => {
    return (
      <div className={shadowedWhiteColor + " " + topStyle}> {/* main view top */}
        <div className="my-auto"> {/* sidebar icon */}
          {!isSidebarVisible ? <HeaderButton icon={faBars} onClick={toggleSidebarVisible} /> : null}
        </div>
        <div className="flex-grow"></div>
        <div className="my-auto"> {/* dot menu */}
          <HeaderButton icon={faEllipsis} onClick={toggleDotMenu} />
          { isDotMenuVisible ? 
            <Menu menuItemsArray={dotMenuItems} isDotMenu={true} userData={userData} /> 
            : null /* dot menu */}
        </div>
      </div>
    )
}

export default HomeTopBar