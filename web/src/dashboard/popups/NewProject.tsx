import React, { FormEvent } from "react";

import { getClassCode } from "../../App";
import { db } from "../../firebase/config";
import { FinalButton, Form, randomString, TextBox } from "./Create";

type Props = { 
	color: string,
	isDarkTheme: boolean,
    setErrorValue: (e: string) => void,
    setErrorDisplay: (e: boolean) => void
}

export type Project = {
	name: string,
	public: boolean,
	files: string[],
	users: string[],
	time?: any
}

export type ProjectWithId = {
	id: string,
	name: string,
	public: boolean,
	files: string[],
	users: string[],
	time?: any
}

export async function createProject(data: Project, id: string) {
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

			const content: Project = {
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
			<TextBox id="name" className={`${props.color}-color ${props.color}-border`} type="text" placeholder="Project Name"/>

			<div className="row">
			<FinalButton className={`${props.color} ${props.color}-border ${darkTheme}-color no-animation finalButton`}>
				Create
			</FinalButton>
			</div>
		</Form>
	);
}

export default NewProject;