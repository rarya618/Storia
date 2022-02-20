import React, { Dispatch } from "react";
import { ElementObject } from "../views/WriterView";

// stores if items are displayed
var itemsDisplayed = false;

// sidebar props type
type Props = { 
    elements: ElementObject[], 
    setElements: Dispatch<ElementObject[]>, 
    hide: boolean, 
    color: string
}

// create sidebar
const Sidebar = ({elements, setElements, hide, color}: Props) => {
    // checks for empty data
    if (elements.length === 1) {
        if (!elements[0].data) {
            itemsDisplayed = false;
        }
    }

    // hides sidebar
    function hideSidebar() {
        if (hide) {
            return "hide "
        }

        return ""
    }

    // shows top border
    function showTopBorder() {
        if (itemsDisplayed) {
            return "sidebar-items ";
        } else {
            return "";
        }
    }

    return (
        <div className={"sidebar no-select " + hideSidebar() + color + "-sidebar"}>
            <div className={"title-bar no-select drag"}>
            </div>
            <div className="menu"></div>

            {/* <button className={"button " + props.color + "-sidebar white-color round-5px " + props.color + "-border"}>
                Title Page
            </button> */}

            <div className={showTopBorder() + color + "-border"}>
                {elements.map((element) => {
                    if (element.type === "heading" && element.data) {
                        itemsDisplayed = true;
                        return (
                            <div className={
                                color + "-sidebar " 
                                + "white-color sidebar-item " 
                                + color + "-border"
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