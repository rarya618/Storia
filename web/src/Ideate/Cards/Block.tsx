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
import { GroupLabel, GroupLabels } from '../StoryMap/Block';

const fontSize = 16;
const padding = 5;
const labelSize = 24;

const Box = styled.div`
    padding: ${padding + 1}px ${padding - 3}px ${padding + 4}px ${padding + 1}px;
    margin: 5px;
    border-radius: 2px;
    text-align: left;
`;

const Title = styled.p`
    font-size: ${fontSize + 4}px;
    margin: ${padding + 1}px ${padding + 2}px 0 ${padding}px;
    font-weight: 600;
`;

export const Text = styled.p`
    font-size: ${fontSize}px;
    margin: 0 ${padding + 2}px ${padding - 1}px ${padding}px;
`;

const Label = styled.p`
    margin: auto ${padding - (28 - labelSize)/2}px;
    min-width: ${labelSize}px;
    width: ${labelSize}px;
    line-height: ${labelSize}px;
    font-size: ${labelSize/2 + 2}px;
    text-align: center;
    vertical-align: middle;
    border-radius: ${labelSize/2}px;
    -webkit-user-select: none;
    user-select: none;
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
                <div className="row flex-space-between no-animation">
                    <Title>{block.title}</Title>
                    <Label className={props.color + ' white-color'}>{props.count}</Label>
                </div>
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
        </Box>
    )
}

export default Block;