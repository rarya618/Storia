import { Dispatch, ReactNode } from "react";

type CheckBoxProps = {
  id: string,
  checked: boolean,
  toggleChecked: Dispatch<boolean>,
  children: ReactNode,
  labelClassName?: string,
}

export const CheckBox = (props: CheckBoxProps) => {
  return (
    <div className="flex items-start gap-2">
      <input
        id={props.id}
        type="checkbox"
        checked={props.checked}
        onChange={(event) => props.toggleChecked(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-purple"
      />
      <label htmlFor={props.id} className={"cursor-pointer select-none " + (props.labelClassName ?? "")}>
        {props.children}
      </label>
    </div>
  )
};
