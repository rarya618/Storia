import React, { useState } from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import Button from '../../objects/Button';
import EditText from './popups/UpdateBlock';
import BlockDropdown from '../StoryMap/popups/BlockDropdown';
import { Card } from '../../dataTypes/Block';
import BlockGroups from '../StoryMap/popups/BlockGroups';
import { getGroupName, Group } from '../../dataTypes/Group';
import { GroupLabel, GroupLabels, Label } from '../StoryMap/Block';

const fontSize = 15;
const padding = 8;
const labelSize = 20;

const Box = styled.div`
    padding: ${padding}px ${padding - 2}px ${padding + 50}px ${padding}px;
    margin: 5px;
    border-radius: 5px;
    text-align: left;
    position: relative;
`;

const Title = styled.p`
    font-size: ${fontSize + 3}px;
    margin: ${padding + 1}px ${padding + 2}px 3px ${padding}px;
    font-weight: 300;
`;

export const Text = styled.p`
    font-size: ${fontSize}px;
    line-height: 1.6em;
    margin: 2px ${padding + 2}px ${padding + 4}px ${padding}px;
`;

type Props = { 
    isDarkTheme: boolean,
    color: string,
    block: Card,
    count: number,
    fileGroups: Group[],
    update: (block: Card, count: number) => void,
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
    documentId: string;
    currentBlock?: Card,
    setCurrentBlock: (block: Card) => void;
}

const Block = (props: Props) => {
    const [showPopup, togglePopup] = useState(false);
    const [currentSetting, toggleSetting] = useState("none");
    const [showDropdown, toggleDropdown] = useState(false);

    const setSetting = (text: string) => {
        toggleSetting(text)
        if (text === "none") togglePopup(false)
        else togglePopup(true)
    }

    let block = props.block;

    let isCurrent = props.currentBlock === block;

    return (
        <Box 
            className={'white recent-block allBorders ' + props.color + '-color no-animation'}
            onClick={() => toggleDropdown(false)}>
            {showPopup && currentSetting === 'edit' ? <EditText 
                color={props.color} 
                isDarkTheme={props.isDarkTheme}
                title={block.title}
                text={block.text}
                closePopup={() => setSetting("none")}
                updateFile={(title: string, text: string) => {
                    let tempBlock: Card = {
                        ...block,
                        title: title,
                        text: text
                    }

                    props.update(tempBlock, props.count);
                    setSetting("none");
                }}
            /> : null}

            {showPopup && currentSetting === 'groupView' ? <BlockGroups 
                isDarkTheme={props.isDarkTheme}
                currentGroups={block.groups ? block.groups : []}
                allGroups={props.fileGroups}
                closePopup={() => setSetting("none")}
                errorValue={props.errorValue}
                setErrorValue={props.setErrorValue}
                errorDisplay={props.errorDisplay}
                setErrorDisplay={props.setErrorDisplay}
                documentId={props.documentId}
                updateDoc={(groups: string[]) => {
                    let tempBlock: Card = {
                        ...block,
                        groups: groups
                    }

                    props.update(tempBlock, props.count);
                }}
            /> : null}

            <div className="row flex-space-between">
                <Title>{block.title}</Title>
                <div style={{ 
                        right: 8
                    }} className="absolute showOnHover">
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={dotsIcon}
                        />}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(!showDropdown)
                        }}
                        className="no-left-margin"
                    />
                </div>
            </div>
            <div className="relative">
                <BlockDropdown 
                    showDropdown={showDropdown}
                    toggleDropdown={toggleDropdown}
                    classCode={props.color}
                    isDarkTheme={props.isDarkTheme}
                    edit={() => {
                        setSetting("edit")
                        toggleDropdown(!showDropdown)
                    }}
                    groupView={() => {
                        setSetting("groupView")
                        toggleDropdown(!showDropdown)
                    }}
                    className="absolute extra-push not-top-layer"
                />
            </div>
            <Text>{block.text}</Text>
            <GroupLabels>
                {block.groups ? block.groups.map(group => {
                    return <GroupLabel className={isCurrent ? props.color + "-color white" : props.color + " white-color"}>{getGroupName(group, props.fileGroups)}</GroupLabel>
                }) : null}
            </GroupLabels>
            <Label className={props.color + '-color showOnHover allBorders'}>{props.count}</Label>

        </Box>
    )
}

export default Block;