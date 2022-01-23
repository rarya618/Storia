const Element = ({className, data}) => {
    return (
        <span contentEditable className={className}>{data}</span>
    )
}

export default Element;