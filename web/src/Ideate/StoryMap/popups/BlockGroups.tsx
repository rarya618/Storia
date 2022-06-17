import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, useState } from "react";
import styled from "styled-components";
import { Group, getGroupName } from "../../../dataTypes/Group";
import Button from "../../../objects/Button";
import ErrorDisplay from "../../../objects/ErrorDisplay";
import Select from "../../../objects/Select";
import { randomString } from "../../../dashboard/popups/Create";
import { Modal } from "../../Cards/popups/NewBlock";
import { createGroup } from "./NewGroup";

const fontSize = 15;
const padding = 5;
const margin = 5;
const offsetH = 4;
const offsetV = -2;

const textboxOffset = 4;

const borderRadius = 5;

const minWidth = 280;

export const Popup = styled.form`
    display: flex;
    flex-direction: column;
    padding: ${margin}px;
    min-width: ${minWidth}px;
    border-radius: 5px;
`;

const GroupDisplay = styled.div`
    padding: ${padding + offsetV}px ${padding - offsetH}px ${padding + offsetV}px ${padding + offsetH}px;
    border-radius: ${borderRadius}px;
    margin: ${margin}px;
    width: calc(100% - ${padding*2 + margin*2}px);
    font-size: ${fontSize}px;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const GroupList = styled.div`
    display: flex;
    flex-direction: column;
    min-width: ${minWidth}px;
    overflow: scroll;
`;

const Title = styled.h1`
    margin: 10px 5px;
    font-weight: 300;
    text-align: center;
    font-size: ${fontSize + 5}px;
`;

const Text = styled.p`
    margin: 10px 5px;
    font-weight: 300;
    text-align: center;
    font-size: ${fontSize}px;
`;

const AddGroup = styled.div`
    display: flex;
    flex-direction: column;
    margin: ${margin}px;
    padding: ${padding + offsetV}px;
    border-radius: ${borderRadius}px;
    border: solid 0.5px;
    text-align: center;
    min-width: ${minWidth - 20}px;
`;

const TextBox = styled.input`
    padding: ${padding + textboxOffset}px;
    background: transparent;
    border: solid 0.5px;
    border-radius: 5px;
    margin: ${margin}px ${margin}px;
    width: calc(100% - ${(padding + textboxOffset)*2 + margin*2}px);
`;

type Props = {
    currentGroups: string[],
    isDarkTheme: boolean,
    allGroups: Group[],
    closePopup: () => void,
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
    documentId: string,
    updateDoc: (groups: string[]) => void
}

const BlockGroups = (props: Props) => {
    const [currentValue, setCurrentValue] = useState<string | Group>("not-selected");

    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    var groups: string[] = [...props.currentGroups];
    const color = "purple";
    var darkTheme = "white";

    const formAction = (event: FormEvent) => {
        event.preventDefault();
        
        try {
            const id = randomString(12);

			// @ts-ignore
			const elementsArray = [...event.target.elements];

			const formData = elementsArray.reduce((acc, element) => {
				if (element.id) {
					acc[element.id] = element.value.trim();
				}

				return acc;
			}, {});
			
            if ((typeof currentValue === "string") && formData.groupName === '') throw("Please select or create a group.");
            else if (currentValue !== "not-selected" && formData.groupName !== '') throw("You can only select an existing group or create one. You cannot do both.");
            else if (typeof currentValue !== "string") {
                groups.push(currentValue.id);
                props.updateDoc(groups);
            } else {
                var data: Group[] = [...props.allGroups];

                const group: Group = {
                    id: id,
                    name: formData.groupName,
                }
                data.push(group);

                createGroup(data, props.documentId)
                .then(async () => {
                    groups.push(group.id)
                    props.updateDoc(groups)
                })
                .catch(err => {
                    setError("Error while creating group in " + props.documentId + ": " + err);
                    setErrorDisplay(true);
                })
            }
        }
        catch (error) {
            setError("Error: " + error);
			setErrorDisplay(true);
        }
    }

    return (
        <Modal onClick={props.closePopup}>
            <div onClick={(e) => e.stopPropagation()}>
                <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
                <Popup onSubmit={formAction} className={darkTheme}>
                    <div className="row mob-col">
                        <div className="grow">
                            <Title>Manage Groups</Title>
                            <GroupList>
                                {groups.length === 0 ? <Text>No groups</Text> : null}
                                {groups.map((groupId, index) => {
                                    return (<GroupDisplay className={"flex-space-between " + color + "-view " + color + "-color"}>
                                        {index + 1}. {getGroupName(groupId, props.allGroups)}
                                        <Button
                                            color={color}
                                            onClick={props.closePopup}
                                            border="no"
                                            text={<FontAwesomeIcon 
                                                icon={faTrash}
                                            />}
                                            className="no-margin"
                                        />
                                    </GroupDisplay>)
                                })}
                            </GroupList>
                        </div>
                        <AddGroup>
                            <Select 
                                current={currentValue}
                                darkTheme={darkTheme} 
                                color={color}
                                onChangeHandler={(e: string | Group) => {
                                    setCurrentValue(e);
                                }}
                                items={props.allGroups}
                            />
                            <p className={color + "-color uneven-spaced"}>or</p>
                            <TextBox id="groupName" className={color + "-color"} placeholder="New group name" />
                            <div className="row flex-space-between">
                                <Button
                                    color={color}
                                    border="no"
                                    text={<FontAwesomeIcon 
                                        icon={faPlus}
                                    />}
                                />
                                <Button
                                    className="no-margin"
                                    border="no"
                                    color={color}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentValue("not-selected");
                                    }}
                                    text={<FontAwesomeIcon 
                                        icon={faTrash}
                                    />}
                                />
                            </div>
                        </AddGroup>
                    </div>
                    <Button
                        color={color}
                        onClick={props.closePopup}
                        border="no"
                        text="Close"
                    />
                </Popup>
            </div>
        </Modal>
    )
}

export default BlockGroups;