import { Link } from "react-router-dom";
import { shadowedWhiteColor } from "../styles/colors"
import { User } from "../datatypes/User";

export type MenuItem = {
  text: string,
  link?: string,
}

let itemStyle = "text-purple cursor-pointer hover:bg-purple-tint px-2.5 py-1.5 rounded";

function Menu({menuItemsArray, isDotMenu, userData}: {menuItemsArray: MenuItem[][], isDotMenu?: boolean, userData?: User}) {
  return (
    <div className={shadowedWhiteColor + " select-none rounded-md absolute px-0 py-1 right-5 top-8 min-w-52 border border-white dark:border-neutral-600"}>
      { isDotMenu && userData ?
        <div className="flex flex-col mx-3 mt-3 mb-0.5 p-4 bg-purple-tint rounded">
          <h2 className="text-purple">{userData.firstName + " " + userData.lastName}</h2>
          <p className="text-purple text-sm mr-4">{userData.email}</p>
          <div className="flex mt-5">
            <Link to="/account" className="text-xs flex-grow text-purple underline">My Account</Link>
            <Link to="/billing" className="text-xs text-purple underline">My Plan</Link>
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
        <div className="px-5 py-4 text-purple">
          <p className="text-sm leading-loose">Beta Plan</p>
          <p className="text-sm leading-loose">Lifetime Availability</p>
          <p className="text-sm leading-loose mt-5">Version 1.0.0</p>
        </div> : null
      }
    </div>
  )
}

export default Menu