import React from 'react';
import styled from 'styled-components';

import { Label, Text } from '../Cards/Block';

const Box = styled.div`
    padding: 7px 5px 5px 5px;
    margin: 5px;
    border-radius: 5px;
    text-align: left;
    display: flex;
    flex-direction: column;
`;

type Props = { 
    isDarkTheme: boolean,
    color: string,
    text: string,
    count: number
}

const Block = (props: Props) => {
    return (
        <Box className={props.color + '-view card ' + props.color + '-color no-animation'}>
            <Text className="grow">{props.text}</Text>
            <div className="row flex-space-between no-animation relative">
                <div></div>
                <Label className={props.color + ' white-color'}>{props.count}</Label>
            </div>
        </Box>
    )
}

export default Block;