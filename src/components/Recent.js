import RecentFile from "./objects/RecentFile";

const Recent = props => {
    return (
        <div className="container">
			<h1 className={"heading small left small-spaced-none " + props.color + "-color"}>Recents</h1>
			<div className="row">
				<RecentFile name="Jack with Barista" isDarkTheme={props.isDarkTheme} link="screenplay"  type="Screenplay" id="hekfdr" />
				<RecentFile name="Jack with Barista" isDarkTheme={props.isDarkTheme} link="teleplay" type="Teleplay" id="kdefsd" />
				<RecentFile name="Jack's Adventures" isDarkTheme={props.isDarkTheme} link="series" type="Series" id="fedsfe" />
			</div>
        </div>
    );
}

export default Recent;