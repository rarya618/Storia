const Sidebar = props => {
    function hideSidebar() {
        if (props.hide) {
            return "hide "
        }

        return ""
    }

    return (
        <div className={"sidebar no-select " + hideSidebar() + props.color + "-sidebar"}>
            <div className={"title-bar no-select drag"}>
            </div>
            <div className="menu"></div>
            {/* <button className={"button " + props.color + "-sidebar white-color round-5px " + props.color + "-border"}>
                Title Page
            </button> */}
            {props.elements.map((element) => {
                if (element.type === "heading") {
                    return <div className={props.color + "-sidebar white-color uppercase sidebar-item " + props.color + "-border"}>
                        {element.data}
                    </div>
                }
                // return <div className={props.color + "-sidebar white-color sidebar-item " + props.color + "-border"}>
                //     {element.type}: {element.data}
                // </div>
            })}
        </div>
    )
}

export default Sidebar;