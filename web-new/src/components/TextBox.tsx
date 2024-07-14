import FormItem from "../datatypes/FormItem";
import { standardWhiteColor } from "../styles/colors";

const TextBox = ({data}: {data: FormItem}) => {
    let type = "text";

    data.id.match("password") ? (type = "password") : (
        data.id === 'email' ? (type = "email") : (type = "text")
    )

    return (
        <div key={data.id} className="text-purple pb-4 w-full">
            <p className="text-purple select-none">{data.label}</p>
            <input 
                className={standardWhiteColor + " font-light text-purple dark:border-neutral-600 border-neutral-300 px-6 py-2 my-1 w-full border rounded text-md"} 
                id={data.id} 
                type={type} 
                placeholder={data.placeholder} 
            />
            {data.subtext}
        </div>
    )
}

export default TextBox;