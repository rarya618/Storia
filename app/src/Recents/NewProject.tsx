import React from "react";

import { capitalize, getClassCode, getFormatsFromType } from "../App";

type Props = { 
	color: string; 
	isDarkTheme: boolean; 
	changeColor: (arg0: string) => void;
	mode: string;
}

const NewProject = (props: Props) => {
	var color = props.color;
	var darkTheme = getClassCode("", props.isDarkTheme);

	return (
		<div className="container row spaced-small no-select">
			<div className={"text-box round-5px " + darkTheme + " flat-spaced"}>
				<input 
					className={
						"inner-text-box absolute push-left transparent left " 
						+ getClassCode("", !props.isDarkTheme) + "-color"
					} 
					type="text" placeholder="Project Name"/>
				<select 
					className={
						"label dropdown center remove-webkit round-5px " 
						+ darkTheme + "-color absolute " + color + " no-border"
					}
					onChange={e => props.changeColor(e.target.value)}
				>
					{getFormatsFromType(props.mode).map(format => {
						return <option value={format}>{capitalize(format)}</option>
					})}
				</select>
			</div>
			<button 
				className={
					"button standard " + color + " " + darkTheme + "-color " 
					+ color + "-border round-5px small-spaced"
				}
			>
				Create
			</button>
		</div>
	);
}

export default NewProject;