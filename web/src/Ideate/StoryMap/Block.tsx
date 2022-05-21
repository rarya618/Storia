import React, { useState } from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faEllipsisV as dotsIcon, faPlus} from '@fortawesome/free-solid-svg-icons';

import Button from '../../objects/Button';
import { Text } from '../Cards/Block';
import UpdateBlock from './popups/UpdateBlock';

const padding = 5;
const margin = 5;

const labelSize = 28;

export const Box = styled.div`
    padding: ${padding + 3}px ${padding}px ${padding}px ${padding - 2}px;
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
    text: string,
    count: number,
    update: (text: string, count: number) => void,
}

const Block = (props: Props) => {
    const [showUpdatePopup, toggleUpdatePopup] = useState(false);

    return (
        <Box className={props.color + '-view recent-block ' + props.color + '-color no-animation'}>
            {showUpdatePopup ? <UpdateBlock 
                color={props.color} 
                isDarkTheme={props.isDarkTheme}
                text={props.text}
                closePopup={() => toggleUpdatePopup(false)}
                updateFile={(text: string) => {
                    props.update(text, props.count);
                    toggleUpdatePopup(false);
                }}
            /> : null}
            <Text className="grow">{props.text}</Text>
            <div className="row flex-space-between no-animation relative">
                <div className="row show-on-hover">
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
                        onClick={() => toggleUpdatePopup(true)}
                    />
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faPlus}
                        />}
                    />
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={dotsIcon}
                        />}
                    />
                </div>
                <Label className={props.color + ' white-color'}>{props.count}</Label>
            </div>
        </Box>
    )
}

export default Block;