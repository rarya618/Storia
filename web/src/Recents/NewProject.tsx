import React, { FormEvent } from "react";

import { getClassCode } from "../App";
import { db } from "../firebase/config";
import { Form, randomString, TextBox, TextBoxContainer } from "./popups/Create";

type Props = { 
	color: string,
	isDarkTheme: boolean,
    setErrorValue: (e: string) => void,
    setErrorDisplay: (e: boolean) => void
}

export type WSProject = {
	name: string,
	public: boolean,
	files: string[],
	users: string[],
	time?: any
}

export type WSProjectWithId = {
	id: string,
	name: string,
	public: boolean,
	files: string[],
	users: string[],
	time?: any
}

async function createProject(data: WSProject, id: string) {
    await db.collection('projects').doc(id).set(data);
}

const NewProject = (props: Props) => {
	const userId = sessionStorage.getItem("userId");

	var darkTheme = getClassCode("", props.isDarkTheme);

	const createNewProject = (event: FormEvent) => {
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
			
            if (formData.name === '') throw("Please enter a project name.");

			const content: WSProject = {
				name: formData.name,
				public: false,
				files: [],
				users: [(userId ? userId : "Guest")]
			}

            createProject(content, id)
            .then(() => {
                window.location.href = '/project/' + id;
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
		<Form onSubmit={createNewProject} className="no-select">
			<TextBoxContainer className={"textbox flat-spaced"}>
				<TextBox id="name" className={props.color + "-color"} type="text" placeholder="Project Name"/>
			</TextBoxContainer>

			<button 
				className={
					"button standard no-grow " + props.color + " " + darkTheme + "-color " 
					+ props.color + "-border round-5px small-spaced"
				}
			>
				Create
			</button>
		</Form>
	);
}

export default NewProject;