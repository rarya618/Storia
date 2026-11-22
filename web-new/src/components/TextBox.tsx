import FormItem from "../datatypes/FormItem";
import { standardWhiteColor } from "../styles/colors";

const TextBox = ({data}: {data: FormItem}) => {
    let type = "text";

    data.id.match("password") ? (type = "password") : (
        data.id === 'email' ? (type = "email") : (type = "text")
    )

    return (
        <div key={data.id} className="text-purple pb-4 w-full">
            <p className="text-purple select-none text-sm">{data.label}</p>
            {
                data.type == "textarea" ?
                <textarea
                    className={standardWhiteColor + " font-light text-neutral-900 dark:text-neutral-200 dark:border-neutral-600 h-32 border-neutral-200 px-5 py-2 my-1 w-full border resize-none rounded text-sm"} 
                    id={data.id}
                    placeholder={data.placeholder} 
                ></textarea> :
            
                <input 
                    className={standardWhiteColor + " font-light text-neutral-900 dark:text-neutral-200 dark:border-neutral-600 border border-neutral-200 px-5 py-2 my-1 w-full rounded text-sm"} 
                    id={data.id} 
                    type={type} 
                    placeholder={data.placeholder} 
                />
            }
            {data.subtext}
        </div>
    )
}

export default TextBox;