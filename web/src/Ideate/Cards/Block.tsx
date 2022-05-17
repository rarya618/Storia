import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
    padding: 5px 5px 7px 2px;
    margin: 5px;
    border-radius: 5px;
    text-align: left;
`;

const Title = styled.p`
    font-size: 18px;
    margin: 7px 8px 5px 8px;
`;

export const Text = styled.p`
    font-size: 16px;
    margin: 4px 8px;
`;

export const Label = styled.p`
    margin: 5px;
    width: 28px;
    line-height: 28px;
    font-size: 14px;
    text-align: center;
    vertical-align: middle;
    border-radius: 20px;
    -webkit-user-select: none;
    user-select: none;
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