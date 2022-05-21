import React, { FormEvent } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { getClassCode } from "../../../App";
import { db } from "../../../firebase/config";
import Button from "../../../objects/Button";

import { Form, randomString, TextBox, TextBoxContainer, ToggleContainer } from "../../../Recents/popups/Create";
import { Group } from "../../../dataTypes/Group";
import { CreatePopup } from "./NewDoc";


type Props = { 
    isDarkTheme: boolean;
    documentId: string;
    color: string;
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
    showPopup: boolean;
    togglePopup: (e: boolean) => void;
    currentGroups: Group[] | null;
}

export async function createGroup(data: Group[], documentId: string) {
    await db.collection('files').doc(documentId).update({groups: data});
}

const NewGroup = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
	var darkTheme = getClassCode("", props.isDarkTheme);
    
    const createNewGroup = (event: FormEvent) => {
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
			
            if (formData.name === '') throw("Please enter a group name.");

            var data: Group[] = [];

            if (props.currentGroups) {
                data = [...props.currentGroups]
            }

			const group: Group = {
                id: id,
				name: formData.name,
			}
            data.push(group);

            createGroup(data, props.documentId)
            .then(async () => {
                window.location.reload();
            })
            .catch(err => {
				props.setErrorValue("Error: " + err);
                props.setErrorDisplay(true);
            })
        }
        catch (error) {
            props.setErrorValue("Error: " + error);
			props.setErrorDisplay(true);
        }
    }

    return (
        <CreatePopup className={getClassCode("", props.isDarkTheme) + " create"}>
            <ToggleContainer>
                <Button
                    className="absolute push-right"
                    color={props.color}
                    onClick={() => {
                        props.togglePopup(!props.showPopup)
                        props.setErrorDisplay(false)
                    }}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={faTrash}
                    />}
                />
            </ToggleContainer>
            <Form onSubmit={createNewGroup} className="no-select">
                <TextBoxContainer className={"textbox flat-spaced"}>
                    <TextBox id="name" className={props.color + "-color"} type="text" placeholder="Group Name"/>
                </TextBoxContainer>
                <button className={
                    "button standard " + props.color + " " + darkTheme + "-color " 
                    + props.color + "-border round-5px small-spaced"
                }>
                    Create
                </button>
            </Form>
        </CreatePopup>
    )
}

export default NewGroup;