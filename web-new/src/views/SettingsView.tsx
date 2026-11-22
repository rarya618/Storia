import { useEffect, useState } from "react";

import { useTitle } from "../misc/title";
import { User } from "../datatypes/User";
import { getUser } from "../firebase/database";
import { createContainerStyle } from "../components/CreatePage";
import AccountView from "./settings/AccountView";
import { currentColor, standardColor } from "../components/Sidebar";

type Item = {
  id: string;
  label: string;
  view?: JSX.Element;
}

// sign in page
const SettingsView = ({toggleSettings}: {toggleSettings:() => void}) => {
  const title = "Settings";
  useTitle(title);

  // get user credentials
  let uid = sessionStorage.getItem('User ID');
  let userId = uid ? uid : "";

  const [userData, setUserData] = useState<User>();
  const [CurrentView, setCurrentView] = useState<JSX.Element>();
  const [current, setCurrent] = useState<string>();

  // update the current item
  const updateCurrent = (item: Item) => {
    setCurrent(item.id)
    setCurrentView(item.view)
  }

  // user data getter
  async function getUserData() {
    const tempDoc = await getUser(userId);
    
    if (tempDoc) {
      setUserData(tempDoc);
    }
  }

  // call getters
  useEffect(() => {
    getUserData();
  }, [])

  const settingsItems: {label: string, items: Item[]}[] = [
    {
      label: "Account",
      items: [
        {id: "account", label: userData?.firstName + " " + userData?.lastName, view: <AccountView userData={userData}/>},
        {id: "preferences", label: "Preferences"}, 
        {id: "notifications", label: "Notifications"}
      ]
    }
  ]

  
  return (
    <div className={createContainerStyle}> {/* page */}
      <div className="bg-white dark:bg-neutral-900 m-10 w-full overflow-hidden rounded-lg flex border border-neutral-200 dark:border-neutral-700">
        <div className="bg-purple-tint dark:bg-purple w-48 m-0 px-2 py-4">
          { settingsItems.map(section => {
            return <div>
              <h2 className="ml-2 mb-1 text-xs font-bold text-purple dark:text-neutral-900">{section.label}</h2>
              { section.items.map(item => {
                let isCurrent = current && (current == item.id);

                return <div className={(isCurrent ? currentColor : standardColor) + " text-sm font-normal pl-3 pr-2 py-1 rounded cursor-pointer"} onClick={() => updateCurrent(item)}>{item.label}</div>
              })}
            </div>
          })}
        </div>
        <button onClick={toggleSettings} className="absolute top-4 right-4 text-sm">Close</button>
        {CurrentView}
      </div>
    </div>
  )
};

export default SettingsView;