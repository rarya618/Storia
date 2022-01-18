const Sidebar = props => {
    function hideSidebar() {
        if (props.hide) {
            return " hide"
        }

        return ""
    }

    return (
        <div className={"sidebar" + hideSidebar() + " " + props.color}>
            <div className={"title-bar no-select drag"}>
            </div>
            <div className="menu"></div>
            <button className={"button " + props.color + "-view white-color white-border"}>
                Title Page
            </button>
        </div>
    )
}

export default Sidebar;