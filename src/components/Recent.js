import RecentFile from "./objects/RecentFile";

const Recent = props => {
    return (
        <div className="container">
			<h1 className={"heading small left small-spaced-none " + props.color + "-color"}>Recents</h1>
			<div className="row">
				<RecentFile name="Jack with Barista" link="screenplay" type="Screenplay" id="hekfdr" />
				<RecentFile name="Jack with Barista" link="teleplay" type="Teleplay" id="kdefsd" />
				<RecentFile name="Jack's Adventures" link="series" type="Series" id="fedsfe" />
			</div>
        </div>
    );
}

export default Recent;