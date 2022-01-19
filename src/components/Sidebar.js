const Sidebar = props => {
    function hideSidebar() {
        if (props.hide) {
            return " hide"
        }

        return ""
    }

    return (
        <div className={"sidebar" + hideSidebar() + " " + props.color + "-sidebar"}>
            <div className={"title-bar no-select drag"}>
            </div>
            <div className="menu"></div>
            <button className={"button " + props.color + "-sidebar white-color round-5px " + props.color + "-border"}>
                Title Page
            </button>
        </div>
    )
}

export default Sidebar;