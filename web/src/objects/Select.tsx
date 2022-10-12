import React, { useState } from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown as downArrow, faAngleUp as upArrow, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { capitalize } from "../App";
import { Group } from "../dataTypes/Group";
import { ProjectWithId } from "../dataTypes/Project";

export type ItemType = string | ProjectWithId | Group;

// component props
type SelectProps = {
    darkTheme: string,
    current: ItemType,
    color: string,
    items: ItemType[],
    onChangeHandler: (text: ItemType) => void,
    id?: string,
    className?: string
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

const displayHeight = 34;
const hPadding = 9;

const borderRadius = 5;

// styled components
const Display = styled.div`
    display: flex;
    border-radius: ${borderRadius}px;
    height: ${displayHeight}px;
    line-height: ${displayHeight}px;
    text-align: left;
    padding: 0 ${hPadding}px;
    margin: 0;
    flex-grow: 1;
    font-weight: 300;
`;

const DropdownContainer = styled.div`
    position: absolute;
    margin: 0;
    width: calc(100% - 50px);
    max-width: 260px;
    border-radius: ${borderRadius}px;
    box-shadow: 2px 5px 10px 0px rgba(0, 0, 0, 0.25);
    z-index: 100;
    overflow: hidden;
`;

const ArrowDisplay = styled.div`
    margin: 0;
    padding: 0;
    font-size: 20px;
    line-height: ${displayHeight}px;
    height: ${displayHeight}px;
    vertical-align: middle;
    align-items: center;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
`;

const ItemDisplay = styled.div`
    padding: 9px ${hPadding}px;
    text-align: left;
    cursor: pointer;
    border-radius: 0;
    font-weight: 300;

`;

const DropdownDisplay = styled.div`
    display: flex;
    flex-direction: row;
    padding: 6px 5px;
`;

const Arrow = (props: ArrowProps) => {
    return (
        <ArrowDisplay onClick={props.onClick} className={props.color + "-color no-animation"}><FontAwesomeIcon className={props.color + "-color no-animation"} icon={props.icon} /></ArrowDisplay>
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
        <DropdownDisplay className={props.className}>
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
                <Display id={props.id} className={props.color + "-color " + props.color + "-view no-border"}>
                    <div className={props.color + "-color grow"}>{(typeof props.current === "string") ? capitalize(props.current) : props.current.name}</div>
                    <Arrow onClick={toggle} color={props.color} icon={arrow}/>
                </Display>
            </div>
        </DropdownDisplay>
    )
}

export default Select;