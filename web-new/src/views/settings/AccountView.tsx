import { User } from "../../datatypes/User";

const AccountView = ({userData}: {userData?: User}) => {
  // basic data
  const accountData: {id: string, label: string, data?: string}[] = [
    {id: "firstName", label: "First Name", data: userData?.firstName},
    {id: "lastName", label: "Last Name", data: userData?.lastName},
    {id: "email", label: "Email", data: userData?.email},
    {id: "password", label: "Password", data: "••••••••"},
    {id: "plan", label: "Plan", data: userData?.plan}
  ];
  return (
    <div className="flex flex-col px-10 py-8">
      <h2 className="text-xl font-light text-purple">Account</h2>
      {accountData.map(displayItem => {
        return (
          <div className="my-3 text-neutral-700 dark:text-neutral-400">
            <h2 className="text-xs mb-1">{displayItem.label}</h2>
            <h2 className="text-sm">{displayItem.data}</h2>
          </div>
        )
      })}
    </div>
  )
}

export default AccountView;