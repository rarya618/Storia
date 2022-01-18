import RecentFile from "./objects/RecentFile";

const Recent = props => {
    return (
        <div className="container">
			<h1 className={"heading small left small-spaced-none " + props.color + "-color"}>Recents</h1>
			<div className="row">
				<RecentFile name="Jack with Barista" type="Film" id="film-jack-with-barista" />
				<RecentFile name="Jack's Adventures" type="Series" id="series-jack-s-adventures" />
			</div>
        </div>
    );
}

export default Recent;