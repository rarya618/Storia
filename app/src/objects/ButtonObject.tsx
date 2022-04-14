type ButtonObject = {
    id: string;
    type?: string;
    text: string | JSX.Element;
    onClick?: string | ((e: Event) => void);
}

export default ButtonObject;