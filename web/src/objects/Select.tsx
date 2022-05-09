import React, { useState } from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown as downArrow, faAngleUp as upArrow, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { capitalize } from "../App";
import { ProjectWithId } from "../Recents/popups/NewProject";

type ItemType = string | ProjectWithId;

// component props
type SelectProps = {
    darkTheme: string,
    current: ItemType,
    color: string,
    items: ItemType[],
    onChangeHandler: (text: ItemType) => void,
    id?: string
}

type ItemProps = {
    id: string,
    display: string,
    color: string,
    onClick: () => void
}

type ArrowProps = {
    color: string,
    icon: IconDefinition,
    onClick: () => void
}

type DropdownProps = {
    items: ItemType[],
    darkTheme: string,
    color: string,
    current: ItemType,
    onChange: (text: ItemType) => void
}

const displayHeight = '40px';

// styled components
const Display = styled.p`
    display: flex;
    border-radius: 5px;
    height: ${displayHeight};
    line-height: ${displayHeight};
    text-align: left;
    padding: 0 10px;
    margin: 0;
    flex-grow: 1;
`;

const DropdownContainer = styled.div`
    position: absolute;
    margin: 0;
    width: calc(100% - 50px);
    max-width: 280px;
    border-radius: 5px;
    box-shadow: 2px 5px 10px 0px rgba(0, 0, 0, 0.25);
    z-index: 100;
    overflow: hidden;
`;

const ArrowDisplay = styled.div`
    margin: 0;
    padding: 0;
    font-size: 24px;
    line-height: ${displayHeight};
    height: ${displayHeight};
    vertical-align: middle;
    align-items: center;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
`;

const ItemDisplay = styled.div`
    padding: 10px;
    text-align: left;
    cursor: pointer;
    border-radius: 0;
`;

const DropdownDisplay = styled.div`
    display: flex;
    flex-direction: row;
    padding: 6px 5px;
`;


const Arrow = (props: ArrowProps) => {
    return (
        <ArrowDisplay onClick={props.onClick} className={props.color + "-color no-animation"}><FontAwesomeIcon className="no-animation" icon={props.icon} /></ArrowDisplay>
    )
}

const Dropdown = (props: DropdownProps) => {
    return (
        <DropdownContainer className={props.darkTheme + " " + props.color + "-color"}>
            {props.items.map((item) => {
                if (typeof item === "string") {
                    return (
                        props.current === item 
                        ? <Item id={item} display={capitalize(item)} color={props.color + ' white'} onClick={() => props.onChange(item)}/>
                        // @ts-ignore
                        : <Item id={item} display={capitalize(item)} color={props.color + '-button ' + props.color} onClick={() => props.onChange(item)}/>
                    )
                } else {
                    return (
                        props.current === item
                        ? <Item id={item.id} display={item.name} color={props.color + ' white'} onClick={() => props.onChange(item)}/>
                        : <Item id={item.id} display={item.name} color={props.color + '-button ' + props.color} onClick={() => props.onChange(item)}/>
                    )
                }
            })}
        </DropdownContainer>
    )
}


const Item = (props: ItemProps) => {
    return (
        <ItemDisplay onClick={props.onClick} className={'no-animation ' + props.color + '-color'}>
            {props.display}
        </ItemDisplay>
    )
}

const Select = (props: SelectProps) => {
	const [showDropdown, setShowDropdown] = useState(false);

    const arrow = showDropdown ? upArrow : downArrow;

    const toggle = () => setShowDropdown(!showDropdown);

    return (
        <DropdownDisplay>
            {showDropdown 
            ? <Dropdown 
                current={props.current} 
                darkTheme={props.darkTheme} 
                items={props.items} 
                color={props.color} 
                onChange={(e) =>
                    {
                        toggle()
                        props.onChangeHandler(e)
                    }
                } />
            : null}
            <div className="grow" onClick={toggle}>
                <Display id={props.id} className={props.darkTheme + "-color " + props.color + " no-border"}>
                    <div className="grow">{(typeof props.current === "string") ? capitalize(props.current) : props.current.name}</div>
                    <Arrow onClick={toggle} color={props.darkTheme} icon={arrow}/>
                </Display>
            </div>
        </DropdownDisplay>
    )
}

export default Select;