import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { useTitle } from "../misc/title";
import { User } from "../datatypes/User";
import { getUser } from "../firebase/database";
import { createContainerStyle, useEscape } from "../components/CreatePage";
import AccountView from "./settings/AccountView";
import { currentColor, standardColor } from "../components/Sidebar";

type Item = {
  id: string;
  label: string;
  soon?: boolean;
}

const SettingsView = ({toggleSettings}: {toggleSettings:() => void}) => {
  useTitle("Settings");
  useEscape(toggleSettings);

  const userId = sessionStorage.getItem('User ID') ?? "";

  const [userData, setUserData] = useState<User>();
  const [current, setCurrent] = useState("account");

  useEffect(() => {
    if (!userId) return;
    getUser(userId).then(user => { if (user) setUserData(user); });
  }, [userId])

  const settingsItems: {label: string, items: Item[]}[] = [
    {
      label: "Account",
      items: [
        {id: "account", label: userData ? userData.firstName + " " + userData.lastName : "Account"},
        {id: "preferences", label: "Preferences", soon: true},
        {id: "notifications", label: "Notifications", soon: true}
      ]
    }
  ]

  return (
    <div className={createContainerStyle} onMouseDown={(event) => { if (event.target === event.currentTarget) toggleSettings(); }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="relative bg-white dark:bg-neutral-900 m-auto w-full max-w-3xl min-h-[28rem] overflow-hidden rounded-lg flex flex-col sm:flex-row border border-neutral-200 dark:border-neutral-700 shadow-xl"
      >
        <nav aria-label="Settings sections" className="bg-purple-tint dark:bg-purple sm:w-52 shrink-0 px-2 py-4">
          { settingsItems.map(section => (
            <div key={section.label}>
              <h2 className="ml-3 mb-1 text-xs font-bold text-purple dark:text-neutral-900">{section.label}</h2>
              { section.items.map(item => {
                if (item.soon) {
                  return (
                    <div key={item.id} aria-disabled="true" className="flex items-center text-sm pl-3 pr-2 py-1 rounded text-purple/70 dark:text-neutral-900/70 cursor-default">
                      <span className="flex-grow">{item.label}</span>
                      <span className="rounded-full border border-current px-1.5 text-[10px] uppercase tracking-wide">Soon</span>
                    </div>
                  )
                }
                const isCurrent = current == item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isCurrent ? "page" : undefined}
                    className={(isCurrent ? currentColor : standardColor) + " block w-full text-left text-sm pl-3 pr-2 py-1 rounded truncate"}
                    onClick={() => setCurrent(item.id)}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <button
          type="button"
          onClick={toggleSettings}
          aria-label="Close settings"
          title="Close"
          className="absolute top-3 right-3 h-8 w-8 rounded-md text-purple hover:bg-purple-tint-hover"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div className="flex-grow min-w-0">
          {current == "account" && <AccountView userData={userData} />}
        </div>
      </div>
    </div>
  )
};

export default SettingsView;
