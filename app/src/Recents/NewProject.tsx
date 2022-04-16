import React, { FormEvent, useState } from "react";

import { getClassCode, getFormatsFromType } from "../App";
import { db } from "../firebase/config";
import Select from "../objects/Select";

type Props = { 
	color: string; 
	isDarkTheme: boolean; 
	changeColor: (arg0: string) => void;
	mode: string;
}

export type WSFile = {
	mode: string,
	name: string,
	public: boolean,
	type: string,
	content: any[],
	users: string[]
}

async function createFile(data: WSFile, id: string) {
    await db.collection('files').doc(id).set(data);
}

// generate random string of specified length
function randomString(length: number) {
    var result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return result;
}

const NewProject = (props: Props) => {
	const formats = getFormatsFromType(props.mode);
	const [currentFormat, setCurrentFormat] = useState(formats[0]);

	var darkTheme = getClassCode("", props.isDarkTheme);

	const createNewFile = (event: FormEvent) => {
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

			const content: WSFile = {
				mode: props.mode,
				name: formData.name,
				public: false,
				type: currentFormat,
				content: [],
				// for testing purposes only
				users: ["test@writerstudio.app"]
			}

            createFile(content, id)
            .then(() => {
                window.location.href = '/' + currentFormat + '/' + id;
            })
            .catch(err => {
                alert("Something went wrong...")
                console.log(err)
            })
        }
        catch (error) {
            alert(error)
        }
    }

	return (
		<form onSubmit={createNewFile} className="container row mob-col spaced-small no-select">
			<div className={"row text-box round-5px " + darkTheme + " flat-spaced"}>
				<input id="name"
					className={
						"inner-text-box transparent left " 
						+ props.color + "-color"
					} 
					type="text" placeholder="Project Name"/>
				
				<Select 
					current={currentFormat}
					darkTheme={darkTheme} 
					color={props.color}
					onChangeHandler={e => {
						setCurrentFormat(e);
						props.changeColor(e);
					}}
					items={formats}
				/>
			</div>
			<button 
				className={
					"button standard " + props.color + " " + darkTheme + "-color " 
					+ props.color + "-border round-5px small-spaced"
				}
			>
				Create
			</button>
		</form>
	);
}

export default NewProject;