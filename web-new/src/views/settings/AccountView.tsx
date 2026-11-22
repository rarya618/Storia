import { User } from "../../datatypes/User";

const AccountView = ({userData}: {userData?: User}) => {
  // basic data
  const accountData: {id: string, label: string, data?: string}[] = [
    {id: "firstName", label: "First name", data: userData?.firstName},
    {id: "lastName", label: "Last name", data: userData?.lastName},
    {id: "email", label: "Email", data: userData?.email},
    {id: "password", label: "Password", data: "••••••••"},
    {id: "plan", label: "Plan", data: userData?.plan}
  ];

  return (
    <div className="flex flex-col px-6 sm:px-10 py-8">
      <h2 className="display text-xl text-purple mb-2">Account</h2>
      <dl>
        {accountData.map(displayItem => (
          <div key={displayItem.id} className="py-3">
            <dt className="text-xs mb-1 text-neutral-500 dark:text-neutral-400">{displayItem.label}</dt>
            <dd className="text-sm text-neutral-800 dark:text-neutral-200 break-all">
              {displayItem.data ?? <span className="inline-block h-4 w-32 rounded bg-neutral-100 dark:bg-neutral-800 align-middle" aria-label="Loading" />}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default AccountView;
