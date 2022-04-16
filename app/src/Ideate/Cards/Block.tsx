import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
    padding: 15px 10px;
    margin: 7px 6px;
    border-radius: 5px;
    text-align: left;
    width: calc(33.3% - 32px);
`;

const Title = styled.p`
    font-size: 24px;
    margin: 4px 6px;
`;

export const Text = styled.p`
    font-size: 18px;
    margin: 6px;
`;

export const Label = styled.p`
    margin: 6px;
    width: 30px;
    line-height: 30px;
    text-align: center;
    vertical-align: middle;
    border-radius: 20px;
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
        <Box className={props.color + '-view ' + props.color + '-color no-animation'}>
            <div className="row flex-space-between no-animation">
                <Title>{props.title}</Title>
                <Label className={props.color + ' white-color'}>{props.count}</Label>
            </div>
            <Text>{props.text}</Text>
        </Box>
    )
}

export default Block;