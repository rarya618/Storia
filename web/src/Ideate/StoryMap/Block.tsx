import React, { useState } from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faEllipsisV as dotsIcon, faPlus} from '@fortawesome/free-solid-svg-icons';

import Button from '../../objects/Button';
import EditText from './popups/UpdateBlock';
import BlockDropdown from './popups/BlockDropdown';
import BlockGroups from './popups/BlockGroups';
import { StoryBlock } from '../../dataTypes/Block';
import { getGroupName, Group } from '../../dataTypes/Group';

const padding = 7;
const margin = 5;

const labelSize = 22;
const fontSize = 16;

const groupLabelPadding = 3;

const labelOffset = (28 - labelSize)/2;

export const Box = styled.div`
    padding: ${padding - 3}px ${padding - labelOffset}px ${padding + 2}px ${padding}px;
    margin: ${margin}px;
    border-radius: 2px;
    text-align: left;
    display: flex;
    flex-direction: row;
`;

export const Label = styled.p`
    margin: ${padding - labelOffset}px ${padding}px 1px ${padding - labelOffset}px;
    min-width: ${labelSize}px;
    width: ${labelSize}px;
    line-height: ${labelSize}px;
    font-size: ${labelSize/2 + 1}px;
    text-align: center;
    vertical-align: middle;
    border-radius: ${labelSize/2}px;
    -webkit-user-select: none;
    user-select: none;
    border: solid 0.5px;
`;

const Text = styled.p`
    font-size: ${fontSize}px;
    margin: ${padding + 3}px ${padding - 5}px ${padding + 2}px ${padding}px;
`;

export const GroupLabels = styled.div`
    margin: ${padding + 2}px ${padding}px ${padding - 5}px ${padding - 1}px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;

export const GroupLabel = styled.div`
    font-size: ${fontSize - (7 - groupLabelPadding)}px;
    margin: ${padding/2}px ${padding + 1}px ${padding/2}px 0;
    border-radius: 2px;
    padding: ${groupLabelPadding}px ${(groupLabelPadding*2)}px;
`;

type Props = { 
    isDarkTheme: boolean,
    color: string,
    block: StoryBlock,
    count: number,
    fileGroups: Group[],
    update: (block: StoryBlock, count: number) => void,
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
    documentId: string;
    currentBlock?: StoryBlock,
    setCurrentBlock: (block: StoryBlock) => void;
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
            className={'recent-block allBorders ' 
                + (isCurrent ? props.color + ' white' : 'white ' + props.color) 
                + '-color'}
            onClick={() => {
                props.setCurrentBlock(block);
                toggleDropdown(false)
            }}>
            {showPopup && currentSetting === 'edit' ? <EditText 
                color={props.color} 
                isDarkTheme={props.isDarkTheme}
                text={block.text}
                closePopup={() => setSetting("none")}
                updateFile={(text: string) => {
                    let tempBlock: StoryBlock = {
                        ...block,
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
                    let tempBlock: StoryBlock = {
                        ...block,
                        groups: groups
                    }

                    props.update(tempBlock, props.count);
                }}
            /> : null}
            <div className="grow">
            <Text className="no-animation">{block.text}</Text>
            <GroupLabels>
                {block.groups ? block.groups.map(group => {
                    return <GroupLabel className={isCurrent ? props.color + "-color white" : props.color + " white-color"}>{getGroupName(group, props.fileGroups)}</GroupLabel>
                }) : null}
            </GroupLabels>
            </div>
            <div className="col flex-space-between no-animation relative">
                <div className="no-animation right">
                    <Button
                        color={isCurrent ? "no-animation white" : props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            className="no-animation"
                            icon={dotsIcon}
                        />}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(!showDropdown)
                        }}
                    />
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
                        className="absolute extra-push-lite not-top-layer"
                    />
                </div>
                
                <Label className={isCurrent ? "white-color" : props.color + "-color"}>{props.count}</Label>
            </div>
        </Box>
    )
}

export default Block;