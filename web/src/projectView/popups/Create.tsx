import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, useState } from "react";
import { getClassCode, getFormatsFromType } from "../../App";
import { db } from "../../firebase/config";
import Button from "../../objects/Button";
import ErrorDisplay from "../../objects/ErrorDisplay";
import Select from "../../objects/Select";
import { CreateButton, CreatePopup, Form, randomString, TextBox, TextBoxContainer, ToggleContainer } from "../../Recents/popups/Create";
import { Document } from "../../Recents/popups/NewFile";

type Props = { 
    isDarkTheme: boolean; 
    mode: string;
	projectId: string;
    currentFiles: string[];
    setMode: (e: string) => void; 
    color: string;
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
}

async function createFile(data: Document, id: string) {
    await db.collection('files').doc(id).set(data);
}

async function updateProject(data: string[], id: string) {
    await db.collection('projects').doc(id).update({files: data});
}

const Create = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
    const formats = getFormatsFromType(props.mode);
	const [currentFormat, setCurrentFormat] = useState(formats[0]);

    const [showPopup, togglePopup] = useState(false);

	var darkTheme = getClassCode("", props.isDarkTheme);

    
    const createNewFile = (event: FormEvent) => {
        event.preventDefault();
		try {
			const id = randomString(12);

			// @ts-ignore
			const elementsArray = [...event.target.elements];

            let files = [...props.currentFiles];

			const formData = elementsArray.reduce((acc, element) => {
				if (element.id) {
					acc[element.id] = element.value.trim();
				}

				return acc;
			}, {});
			
            if (formData.name === '') throw("Please enter a document name.");

			const content: Document = {
				mode: props.mode,
				name: formData.name,
				public: false,
				type: currentFormat,
				content: [],
				users: [(userId ? userId : "Guest")]
			}

            createFile(content, id)
            .then(async () => {
                files.push(id)
                await updateProject(files, props.projectId);
                window.location.href = '/' + currentFormat + '/' + id;
            })
            .catch(err => {
				props.setErrorValue(err);
                props.setErrorDisplay(true);
            })
        }
        catch (error) {
			// @ts-ignore
            props.setErrorValue(error);
			props.setErrorDisplay(true);
        }
    }

    return (
        <>
        {showPopup ? (<CreatePopup className={getClassCode("", props.isDarkTheme) + " create"}>
            <ToggleContainer>
                <Button
                    className="absolute push-right"
                    color={props.color}
                    onClick={() => {
                        togglePopup(!showPopup)
                        props.setErrorDisplay(false)
                    }}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={faTrash}
                    />}
                />
            </ToggleContainer>
            <Form onSubmit={createNewFile} className="no-select">
			<TextBoxContainer className={"textbox flat-spaced"}>
				<TextBox id="name" className={props.color + "-color"} type="text" placeholder="Document Name"/>
			</TextBoxContainer>
			<Select 
				current={currentFormat}
				darkTheme={darkTheme} 
				color={props.color}
				onChangeHandler={e => {
                    if (typeof e === 'string') { 
						setCurrentFormat(e);
                    }
				}}
				items={formats}
			/>
			<button 
				className={
					"button standard " + props.color + " " + darkTheme + "-color " 
					+ props.color + "-border round-5px small-spaced"
				}
			>
				Create
			</button>
		</Form>
        </CreatePopup>) : null }
        <CreateButton 
            className={props.color + " white-color create"}
            onClick={() => togglePopup(!showPopup)}>
            Create
        </CreateButton>
        </>)
}

export default Create;