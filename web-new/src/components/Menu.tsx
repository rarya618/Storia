import { Link } from "react-router-dom";
import { shadowedWhiteColor } from "../styles/colors"
import { User } from "../datatypes/User";

export type MenuItem = {
  text: string,
  link?: string,
  soon?: boolean,
}

const itemStyle = "flex w-full items-center text-left text-purple text-sm px-4 py-1.5 rounded ";
const activeItemStyle = itemStyle + "cursor-pointer hover:bg-purple-tint-hover";
const soonItemStyle = itemStyle + "cursor-default opacity-60";

type MenuProps = {
  menuItemsArray: MenuItem[][],
  isDotMenu?: boolean,
  userData?: User,
  toggleSettings?: () => void,
  onClose?: () => void,
}

function Menu({menuItemsArray, isDotMenu, userData, toggleSettings, onClose}: MenuProps) {
  return (
    <div role="menu" className={shadowedWhiteColor + " z-50 select-none rounded-md absolute right-4 top-10 min-w-56 border border-neutral-100 dark:border-neutral-700 overflow-hidden"}>
      { isDotMenu && userData ?
        <div className="flex flex-col mx-2 mt-2 mb-0.5 p-4 bg-purple-tint-hover rounded">
          <p className="text-purple">{userData.firstName + " " + userData.lastName}</p>
          <p className="text-purple text-sm mr-4 break-all">{userData.email}</p>
          <div className="flex mt-5">
            <button
              type="button"
              role="menuitem"
              className="text-xs flex-grow text-left font-semibold text-purple hover:opacity-80"
              onClick={() => { toggleSettings?.(); onClose?.(); }}
            >
              Settings
            </button>
            <Link role="menuitem" to="/account/logout" className="text-xs text-purple font-semibold hover:opacity-80">Log out</Link>
          </div>
        </div> : null
      }
      {
        menuItemsArray.map((menuItems, index) => {
          return (
            <div key={index} role="group" className="border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-700">
              {
                menuItems.map(menuItem => {
                  if (menuItem.soon || !menuItem.link) {
                    return (
                      <div key={menuItem.text} role="menuitem" aria-disabled="true" className={soonItemStyle}>
                        <span className="flex-grow">{menuItem.text}</span>
                        <span className="ml-3 rounded-full border border-purple/40 px-1.5 text-[10px] uppercase tracking-wide">Soon</span>
                      </div>
                    )
                  }
                  return (
                    <Link key={menuItem.text} role="menuitem" to={menuItem.link} className={activeItemStyle} onClick={onClose}>
                      {menuItem.text}
                    </Link>
                  )
                })
              }
            </div>
          )
        })
      }

      { isDotMenu ?
        <div className="px-4 py-3 text-purple">
          <p className="text-xs leading-loose">Beta Plan</p>
          <p className="text-xs leading-loose">Lifetime Availability</p>
          <p className="text-xs leading-loose mt-5">Version 1.0.0</p>
        </div> : null
      }
    </div>
  )
}

export default Menu
