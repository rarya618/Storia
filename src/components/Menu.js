import {useState} from 'react';
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUndo, faRedo, faBars, faSearch, faComment, faAlignLeft, faAlignCenter, faAlignRight, faAlignJustify} from '@fortawesome/free-solid-svg-icons';

import Button from "../objects/Button";
import ElementsDropdown from "../objects/ElementsDropdown";
import { getClassCode } from "../App";

const Menu = props => {
    const [border, setBorder] = useState(false);
    const color = props.color;

    function borderValue() {
        if (border) {
            return color;
        } else {
            return "no";
        }
    }

    return (
        <div className={"menu"}>
            {/* Sidebar Button */}
            <Button id="sidebar" onClick={props.hideSidebar} text={<FontAwesomeIcon icon={faBars} />} color={color} border={borderValue()} />
            
            {/* Undo and Redu Buttons */}
            <Button 
                text={<FontAwesomeIcon icon={faUndo} />} 
                color={color} border={borderValue()} />
            <Button text={<FontAwesomeIcon icon={faRedo} />} color={color} border={borderValue()} />
            
            {/* Elements Dorpdown */}
            <ElementsDropdown text="Element" color={color} border={borderValue()} />
            
            {/* Buld, Italic, and Underline Buttons */}
            {/* <Button text={<strong>B</strong>} color={color} border={borderValue()} />
            <Button text={<i>I</i>} color={color} border={borderValue()} />
            <Button text={<u>U</u>} color={color} border={borderValue()} /> */}
            
            {/* Alignment Menu */}
            {/* <Button text={<FontAwesomeIcon icon={faAlignLeft} />} color={color} border={borderValue()} />
            <Button text={<FontAwesomeIcon icon={faAlignCenter} />} color={color} border={borderValue()} />
            <Button text={<FontAwesomeIcon icon={faAlignRight} />} color={color} border={borderValue()} />
            <Button text={<FontAwesomeIcon icon={faAlignJustify} />} color={color} border={borderValue()} /> */}
            
            {/* Find Button */}
            <Button text={<FontAwesomeIcon icon={faSearch} />} color={color} border={borderValue()} />
            
            {/* Comment Button */}
            <Button text={<FontAwesomeIcon icon={faComment} />} color={color} border={borderValue()} />

            {/* Home Button */}
            <Link to="/">
                <Button text={<FontAwesomeIcon icon={faHome} />}  color={color} border={borderValue()} />
            </Link>
        </div>
    )
}

export default Menu;