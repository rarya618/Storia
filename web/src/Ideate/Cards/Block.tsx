import React from 'react';
import styled from 'styled-components';
import { Label } from '../StoryMap/Block';

const fontSize = 16;
const padding = 6;

const Box = styled.div`
    padding: ${padding}px ${padding}px ${padding + 2}px ${padding - 3}px;
    margin: 5px;
    border-radius: 5px;
    text-align: left;
`;

const Title = styled.p`
    font-size: ${fontSize + 2}px;
    margin: ${padding + 1}px ${padding + 2}px ${padding - 1}px ${padding + 2}px;
`;

export const Text = styled.p`
    font-size: ${fontSize}px;
    margin: 4px 8px;
`;

type Props = { 
    isDarkTheme: boolean,
    color: string,
    title: string,
    text: string,
    count: number
}

const Block = (props: Props) => {
    return (
        <Box className={props.color + '-view recent-block ' + props.color + '-color no-animation'}>
            <div className="row flex-space-between no-animation">
                <Title>{props.title}</Title>
                <Label className={props.color + ' white-color'}>{props.count}</Label>
            </div>
            <Text>{props.text}</Text>
        </Box>
    )
}

export default Block;