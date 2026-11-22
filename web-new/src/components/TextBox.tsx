import FormItem from "../datatypes/FormItem";
import { standardWhiteColor } from "../styles/colors";

const fieldStyle = standardWhiteColor + " font-light text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 border border-neutral-300 dark:border-neutral-600 px-4 py-2 my-1 w-full rounded text-sm transition-colors hover:border-neutral-400 dark:hover:border-neutral-500 focus:border-purple focus:outline-none focus:ring-2 focus:ring-purple/30";

const TextBox = ({data, autoFocus}: {data: FormItem, autoFocus?: boolean}) => {
    let type = "text";

    data.id.match("password") ? (type = "password") : (
        data.id === 'email' ? (type = "email") : (type = "text")
    )

    return (
        <div className="pb-4 w-full">
            <label htmlFor={data.id} className="block text-purple select-none text-sm">{data.label}</label>
            {
                data.type == "textarea" ?
                <textarea
                    className={fieldStyle + " h-32 resize-none"}
                    id={data.id}
                    name={data.id}
                    placeholder={data.placeholder}
                    autoFocus={autoFocus}
                ></textarea> :

                <input
                    className={fieldStyle}
                    id={data.id}
                    name={data.id}
                    type={type}
                    placeholder={data.placeholder}
                    autoComplete={data.autoComplete}
                    autoFocus={autoFocus}
                />
            }
            {data.subtext}
        </div>
    )
}

export default TextBox;
