import { getClassCode } from "./objects/RecentFile";

const NewProject = props => {
	var color = props.color;

	return (
		<div className="container row spaced-small no-select">
			<div className="text-box round-5px white flat-spaced">
				<input className="inner-text-box absolute push-left transparent left" type="text" placeholder="Project Name"/>
				<select 
					className={"label dropdown round-5px white-color absolute center " + color + " no-border"}
					onChange={e => props.changeColor(getClassCode(e.target.value))}>
					<option value="Film" selected>Screenplay</option>
					<option value="TV Episode">Teleplay</option>
					<option value="Series">Series</option>
				</select>
			</div>
			<button className={"button " + color + " white-color " + color + "-border round-5px small-spaced"}>Create</button>
		</div>
	);
}

export default NewProject;