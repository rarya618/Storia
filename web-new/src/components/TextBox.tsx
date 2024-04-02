import FormItem from "../datatypes/FormItem";
import { standardWhiteColor } from "../styles/colors";

const InputTextBox = (formItem: FormItem) => {
    let type = "text";

    formItem.id.match("password") ? (type = "password") : (
        formItem.id === 'email' ? (type = "email") : (type = "text")
    )

    return (
        <div className="text-purple pb-4 w-full">
            <p className="text-purple select-none">{formItem.label}</p>
            <input className={standardWhiteColor + " text-purple dark:border-neutral-600 border-neutral-300 px-6 py-2 my-1 w-full border rounded text-lg"} id={formItem.id} type={type} placeholder={formItem.placeholder} />
            {formItem.subtext}
        </div>
    )
}

export default InputTextBox;