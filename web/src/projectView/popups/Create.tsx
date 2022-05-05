import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, useState } from "react";
import styled from "styled-components";
import { getClassCode, getFormatsFromType } from "../../App";
import { db } from "../../firebase/config";
import Button from "../../objects/Button";
import ErrorDisplay from "../../objects/ErrorDisplay";
import Select from "../../objects/Select";
import { WSFile } from "../../Recents/popups/NewFile";

// generate random string of specified length
export function randomString(length: number) {
    var result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return result;
}

const CreateButton = styled.button`
    position: fixed;
    z-index: 100;
    bottom: 0;
    right: 0;
    padding: 2.5px;
    border-radius: 25px;
    border: none;
    width: 50px;
    height: 50px;
    font-size: 28px;
`;

const CreatePopup = styled.div`
    padding: 5px;
    width: 280px;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    position: fixed;
    z-index: 100;
    bottom: 0;
    right: 0;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

export const TextBoxContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding: 5px 8px;
    width: calc(100% - 26px);
    height: 30px;
    margin: 5px;
    border: none;
    border-radius: 5px;
`;

export const TextBox = styled.input`
    flex-grow: 1;
    height: 30px;
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
`;

const ToggleContainer = styled.div`
    display: flex;
    flex-grow: 0;
    margin: auto;
    height: 40px;
    align-items: center;
    text-align: center;
    justify-content: center;
`;

type Props = { 
    isDarkTheme: boolean; 
    mode: string;
	projectId: string;
    currentFiles: string[];
    setMode: (e: string) => void; 
    color: string;
}

async function createFile(data: WSFile, id: string) {
    await db.collection('files').doc(id).set(data);
}

async function updateProject(data: string[], id: string) {
    await db.collection('projects').doc(id).update({files: data});
}

const Create = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
    const [errorValue, setErrorValue] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

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

			const content: WSFile = {
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
				setErrorValue(err);
                setErrorDisplay(true);
            })
        }
        catch (error) {
			// @ts-ignore
            props.setErrorValue(error);
			setErrorDisplay(true);
        }
    }

    return (
        showPopup ? (<CreatePopup className={getClassCode("", props.isDarkTheme) + " create"}>
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
            <ToggleContainer>
                <Button
                    className="absolute push-right"
                    color={props.color}
                    onClick={() => {
                        togglePopup(!showPopup)
                        setErrorDisplay(false)
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
					setCurrentFormat(e);
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
        </CreatePopup>) :
        <CreateButton 
            className={props.color + " white-color create"}
            onClick={() => togglePopup(!showPopup)}>
            +
        </CreateButton>
    )
}

export default Create;