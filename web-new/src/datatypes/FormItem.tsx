type FormItem = {
    id: string,
    label: string,
    placeholder: string,
    type?: string,
    autoComplete?: string,
    optional?: boolean,
    subtext?: JSX.Element
};

export default FormItem;
