import React from "react";
import RecentFile from "../objects/RecentFile";

type Props = { color: string; isDarkTheme: boolean; };

const Recent = (props: Props) => {
    return (
        <div className="container">
			<h1 className={"heading small left small-spaced-none " + props.color + "-color"}>Recents</h1>
			<div className="row wrap">
				<RecentFile name="Sample Screenplay" isDarkTheme={props.isDarkTheme} link="screenplay" type="Screenplay" id="smpsp" />
				{/* <RecentFile name="Sample Teleplay" isDarkTheme={props.isDarkTheme} link="teleplay" type="Teleplay" id="smptp" />
				<RecentFile name="Sample Series" isDarkTheme={props.isDarkTheme} link="series" type="Series" id="smpse" /> */}
			</div>
        </div>
    );
}

export default Recent;