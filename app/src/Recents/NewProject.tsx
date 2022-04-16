import React, { useState } from "react";

import { capitalize, getClassCode, getFormatsFromType } from "../App";
import Select from "../objects/Select";

type Props = { 
	color: string; 
	isDarkTheme: boolean; 
	changeColor: (arg0: string) => void;
	mode: string;
}

const NewProject = (props: Props) => {
	const formats = getFormatsFromType(props.mode);
	const [currentFormat, setCurrentFormat] = useState(formats[0]);

	var color = props.color;
	var darkTheme = getClassCode("", props.isDarkTheme);

	return (
		<form className="container row spaced-small no-select">
			<div className={"row text-box row round-5px " + darkTheme + " flat-spaced"}>
				<input 
					id="name"
					className={
						"inner-text-box transparent left " 
						+ getClassCode("", !props.isDarkTheme) + "-color"
					} 
					type="text" placeholder="Project Name"/>
				
				<Select 
					id="format" 
					current={currentFormat}
					darkTheme={darkTheme} 
					color={color}
					onChangeHandler={e => {
						setCurrentFormat(e);
						props.changeColor(e);
					}}
					items={formats}
				/>
			</div>
			<button 
				className={
					"button standard " + color + " " + darkTheme + "-color " 
					+ color + "-border round-5px small-spaced"
				}
			>
				Create {capitalize(currentFormat)}
			</button>
		</form>
	);
}

export default NewProject;