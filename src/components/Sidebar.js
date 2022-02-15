import { useState } from "react";
var itemsDisplayed = false;

const Sidebar = props => {
    if (props.elements.length === 1) {
        if (!props.elements[0].data) {
            itemsDisplayed = false;
        }
    }

    function hideSidebar() {
        if (props.hide) {
            return "hide "
        }

        return ""
    }

    function showTopBorder() {
        if (itemsDisplayed) {
            return "sidebar-items ";
        } else {
            return "";
        }
    }

    return (
        <div className={"sidebar no-select " + hideSidebar() + props.color + "-sidebar"}>
            <div className={"title-bar no-select drag"}>
            </div>
            <div className="menu"></div>

            {/* <button className={"button " + props.color + "-sidebar white-color round-5px " + props.color + "-border"}>
                Title Page
            </button> */}

            <div className={showTopBorder() + props.color + "-border"}>
                {props.elements.map((element) => {
                    if (element.type === "heading" && element.data) {
                        itemsDisplayed = true;
                        return (
                            <div className={
                                props.color + "-sidebar " 
                                + "white-color uppercase sidebar-item " 
                                + props.color + "-border"
                            }>
                                {element.data}
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    )
}

export default Sidebar;