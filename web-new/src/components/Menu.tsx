import { Link } from "react-router-dom";
import { shadowedWhiteColor } from "../styles/colors"
import { User } from "../datatypes/User";
import { createLink } from "../views/create/CreateAccount";

export type MenuItem = {
  text: string,
  link?: string,
}

let itemStyle = "text-purple text-sm cursor-pointer hover:bg-purple-tint-hover px-4 mx-0 py-1.5 rounded";

function Menu({menuItemsArray, isDotMenu, userData, toggleSettings}: {menuItemsArray: MenuItem[][], isDotMenu?: boolean, userData?: User, toggleSettings?: () => void}) {
  return (
    <div className={shadowedWhiteColor + " select-none rounded-md absolute px-0 py-0 right-5 top-8 min-w-52 border border-white dark:border-neutral-600"}>
      { isDotMenu && userData ?
        <div className="flex flex-col mx-2 mt-2 mb-0.5 p-4 bg-purple-tint-hover rounded">
          <h2 className="text-purple">{userData.firstName + " " + userData.lastName}</h2>
          <p className="text-purple text-sm mr-4">{userData.email}</p>
          <div className="flex mt-5">
            <p 
              className="m-0 text-xs flex-grow font-semibold text-purple cursor-pointer hover:opacity-80"
              onClick={toggleSettings}
            >
              Settings
            </p>
            {createLink({text: "Log out", href: "/account/logout"}, "text-xs")}
          </div>
        </div> : null
      }
      {
        menuItemsArray.map(menuItems => {
          return (
            <div className="border-b px-2 py-1.5 dark:border-neutral-600">
              {
                menuItems.map(menuItem => {
                  if (menuItem.link) {
                    return (
                      <Link to={menuItem.link}>
                        <div className={itemStyle}>
                          {menuItem.text}
                        </div>
                      </Link>
                    )
                  }
                  return (
                    <div className={itemStyle}>
                      {menuItem.text}
                    </div>
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