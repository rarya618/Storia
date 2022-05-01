import {useState} from 'react';
import { Link } from "react-router-dom";

import Button from "./Button";
import React from 'react';
import ButtonObject from './ButtonObject';

type Props = { 
    isDarkTheme: boolean;
    color: string;
    border: boolean;
    data: ButtonObject[];
    className?: string;
}

const Menu = (props: Props) => {
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
        <div className={"menu " + props.className}>
            {
                props.data.map(button => {
                    if (button.type === "link") {
                        return (
                            // @ts-ignore
                            <Link to={button.onClick}>
                                <Button 
                                    id={button.id}
                                    text={button.text} 
                                    color={color} 
                                    border={borderValue()} 
                                />
                            </Link>
                        )
                    }
                    return (
                        <Button 
                            id={button.id} 
                            // @ts-ignore
                            onClick={button.onClick} 
                            text={button.text} 
                            color={color} 
                            border={borderValue()} 
                        />
                    )
                })
            }
        </div>
    )
}

export default Menu;