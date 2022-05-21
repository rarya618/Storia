import React, { useState } from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import Button from '../../objects/Button';
import { Label } from '../StoryMap/Block';
import BlockDropdown from '../StoryMap/popups/BlockDropdown';

const fontSize = 16;
const padding = 5;

const Box = styled.div`
    padding: ${padding + 1}px ${padding - 3}px ${padding + 4}px ${padding + 1}px;
    margin: 5px;
    border-radius: 5px;
    text-align: left;
`;

const Title = styled.p`
    font-size: ${fontSize + 3}px;
    margin: ${padding + 1}px ${padding + 2}px ${padding - 1}px ${padding}px;
`;

export const Text = styled.p`
    font-size: ${fontSize}px;
    margin: ${padding - 1}px ${padding + 2}px ${padding - 1}px ${padding}px;
`;

type Props = { 
    isDarkTheme: boolean,
    color: string,
    title: string,
    text: string,
    count: number
}

const Block = (props: Props) => {
    const [showDropdown, toggleDropdown] = useState(false);

    return (
        <Box 
            className={props.color + '-view recent-block ' + props.color + '-color no-animation'}
            onClick={() => toggleDropdown(false)}>
            <div className="row flex-space-between">
                <div className="row flex-space-between no-animation">
                    <Title>{props.title}</Title>
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
                    className="absolute extra-push not-top-layer"
                />
            </div>
            <Text>{props.text}</Text>
        </Box>
    )
}

export default Block;