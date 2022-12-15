import React from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight, faEllipsisV as dotsIcon } from "@fortawesome/free-solid-svg-icons";

import { Block } from "../dataTypes/Block";
import { getGroupName, Group } from "../dataTypes/Group";
import Button from "../objects/Button";

type Props = {
    color: string;
    block?: Block;
    fileGroups: Group[];
    showSidebar: boolean;
    closeSidebar: () => void;
}

const fontSize = 15;

const labelMargin = 7;

const Labels = styled.div`
    margin: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;

const Label = styled.div`
    font-size: ${fontSize - 2}px;
    margin: 0 ${labelMargin}px ${labelMargin}px 0;
    border-radius: 2px;
    padding: 5px 10px;
`;

const Sidebar = styled.div`
    min-width: 250px;
    max-width: 250px;
    display: flex;
    flex-direction: column;
    padding: 0;
`;

const Top = styled.div`
    display: flex;
    padding: 10px 5px 10px 1px;
    height: 40px;
`;

const Content = styled.div`
    padding: 0 10px;
`;

const Text = styled.p`
    margin: 0 5px 25px 1px;
    text-align: left;
    font-size: ${fontSize}px;
    line-height: 1.6em;
`;

const RightSidebar = (props: Props) => {
    let block = props.block;

    return (
        <Sidebar className={props.color + "-color leftBorder" + (props.showSidebar ? "" : " rightHide")}>
            <Top className="flex-space-between">
                <Button
                    color={props.color}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={faAngleDoubleRight}
                    />}
                    onClick={(e) => {
                        e.preventDefault();
                        props.closeSidebar();
                    }}
                />
                <Button
                    color={props.color}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={dotsIcon}
                    />}
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                />
            </Top>
            {block ?
            <Content>
                <Text>{block.text}</Text>
                <Labels>
                    {block.groups ? block.groups.map(group => {
                        return <Label className={props.color + " white-color"}>{getGroupName(group, props.fileGroups)}</Label>
                    }) : null}
                </Labels>
            </Content>
            : null}
        </Sidebar>
    )
}

export default RightSidebar;