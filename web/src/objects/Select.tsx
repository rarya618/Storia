import React, { useState } from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown as downArrow, faAngleUp as upArrow, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { capitalize } from "../App";

// component props
type SelectProps = {
    darkTheme: string,
    current: string,
    color: string,
    items: string[],
    onChangeHandler: (text: string) => void,
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
    items: string[],
    darkTheme: string,
    color: string,
    current: string,
    onChange: (text: string) => void
}

// styled components
const Display = styled.p`
    border-radius: 15px;
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    margin: 0 5px;
`;

const DropdownContainer = styled.div`
    position: absolute;
    margin: 5px;
    border-radius: 5px;
    box-shadow: 2px 5px 10px 0px rgba(0, 0, 0, 0.25);
    z-index: 100;
    overflow: hidden;
`;

const ArrowDisplay = styled.div`
    margin: 0;
    padding: 0 2.5px;
    font-size: 28px;
    line-height: 30px;
    height: 30px;
    vertical-align: middle;
    align-items: center;
`;

const ItemDisplay = styled.div`
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 0;
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
                return (
                    props.current === item 
                    ? <Item id={item} display={capitalize(item)} color={props.color + ' white'} onClick={() => props.onChange(item)}/>
                    : <Item id={item} display={capitalize(item)} color={props.color + '-button ' + props.color} onClick={() => props.onChange(item)}/>)

                
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

    return (
        <>
            <div onClick={() => setShowDropdown(!showDropdown)}>
                <Display id={props.id} className={props.darkTheme + "-color " + props.color + " no-border"}>
                    {capitalize(props.current)}
                </Display>
                {showDropdown ? <Dropdown current={props.current} darkTheme={props.darkTheme} items={props.items} color={props.color} onChange={props.onChangeHandler} /> : null}
            </div>
            <Arrow onClick={() => setShowDropdown(!showDropdown)} color={props.color} icon={arrow}/>
        </>
    )
}

export default Select;