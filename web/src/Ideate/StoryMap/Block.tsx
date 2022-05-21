import React, { useState } from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faEllipsisV as dotsIcon, faPlus} from '@fortawesome/free-solid-svg-icons';

import Button from '../../objects/Button';
import { Text } from '../Cards/Block';
import EditText from './popups/UpdateBlock';
import BlockDropdown from './popups/BlockDropdown';
import BlockGroups from './popups/BlockGroups';
import { StoryBlock } from '../../dataTypes/Block';
import { Group } from '../../dataTypes/Group';

const padding = 5;
const margin = 5;

const labelSize = 28;

export const Box = styled.div`
    padding: ${padding + 2}px ${padding}px ${padding}px ${padding + 2}px;
    margin: ${margin}px;
    border-radius: 5px;
    text-align: left;
    display: flex;
    flex-direction: column;
`;

export const Label = styled.p`
    margin: ${padding}px;
    min-width: ${labelSize}px;
    width: ${labelSize}px;
    line-height: ${labelSize}px;
    font-size: ${labelSize/2}px;
    text-align: center;
    vertical-align: middle;
    border-radius: ${labelSize/2}px;
    -webkit-user-select: none;
    user-select: none;
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

    return (
        <Box 
            className={props.color + '-view recent-block ' + props.color + '-color no-animation'}
            onClick={() => toggleDropdown(false)}>
            {showPopup && currentSetting === 'edit' ? <EditText 
                color={props.color} 
                isDarkTheme={props.isDarkTheme}
                text={props.block.text}
                closePopup={() => setSetting("none")}
                updateFile={(text: string) => {
                    let tempBlock: StoryBlock = {
                        ...props.block,
                        text: text
                    }

                    props.update(tempBlock, props.count);
                    setSetting("none");
                }}
            /> : null}
            {showPopup && currentSetting === 'groupView' ? <BlockGroups 
                isDarkTheme={props.isDarkTheme}
                currentGroups={props.block.groups ? props.block.groups : []}
                allGroups={props.fileGroups}
                closePopup={() => setSetting("none")}
                errorValue={props.errorValue}
                setErrorValue={props.setErrorValue}
                errorDisplay={props.errorDisplay}
                setErrorDisplay={props.setErrorDisplay}
                documentId={props.documentId}
                updateDoc={(groups: string[]) => {
                    let tempBlock: StoryBlock = {
                        ...props.block,
                        groups: groups
                    }

                    props.update(tempBlock, props.count);
                }}
            /> : null}
            <Text className="grow">{props.block.text}</Text>
            <div className="row flex-space-between no-animation relative">
                <div className={"row" + (showDropdown ? "" : " show-on-hover")}>
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faTrash}
                        />}
                    />
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faPen}
                        />}
                        onClick={() => setSetting("edit")}
                    />
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faPlus}
                        />}
                    />
                    <div>
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
                        />
                        <BlockDropdown 
                            showDropdown={showDropdown}
                            toggleDropdown={toggleDropdown}
                            classCode={props.color}
                            isDarkTheme={props.isDarkTheme}
                            edit={() => setSetting("edit")}
                            groupView={() => setSetting("groupView")}
                            className="absolute no-top-margin not-top-layer"
                        />
                    </div>
                </div>
                
                
                <Label className={props.color + ' white-color'}>{props.count}</Label>
            </div>
        </Box>
    )
}

export default Block;