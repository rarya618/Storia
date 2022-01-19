import {useState} from 'react';
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUndo, faRedo, faBars, faSearch, faComment} from '@fortawesome/free-solid-svg-icons';

import Button from "./objects/Button";
import ElementsDropdown from "./objects/ElementsDropdown";
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
        <div className={"menu " + getClassCode("", props.isDarkTheme)}>
            <Link to="/">
                <Button text={<FontAwesomeIcon icon={faHome} />}  color={color} border={borderValue()} />
            </Link>
            <Button onClick={props.hideSidebar} text={<FontAwesomeIcon icon={faBars} />} color={color} border={borderValue()} />
            <Button 
                text={<FontAwesomeIcon icon={faUndo} />} 
                color={color} border={borderValue()} />
            <Button text={<FontAwesomeIcon icon={faRedo} />} color={color} border={borderValue()} />
            <ElementsDropdown text="Element" color={color} border={borderValue()} />
            <Button text={<strong>B</strong>} color={color} border={borderValue()} />
            <Button text={<i>I</i>} color={color} border={borderValue()} />
            <Button text={<u>U</u>} color={color} border={borderValue()} />
            <Button text={<FontAwesomeIcon icon={faSearch} />} color={color} border={borderValue()} />
            <Button text={<FontAwesomeIcon icon={faComment} />} color={color} border={borderValue()} />
        </div>
    )
}

export default Menu;