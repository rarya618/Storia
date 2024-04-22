import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
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

const HomeTopBar = ({isDotMenuVisible, toggleDotMenu, userData}: {isDotMenuVisible: boolean, toggleDotMenu: () => void, userData: User | undefined}) => {
  return (
    <div className={shadowedWhiteColor + " flex h-11 px-4"}> {/* main view top */}
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