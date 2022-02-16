import React from "react";
import RecentFile from "../objects/RecentFile";

type Props = { color: string; isDarkTheme: boolean; };

const Recent = (props: Props) => {
    return (
        <div className="container">
			<h1 className={"heading small left small-spaced-none " + props.color + "-color"}>Recents</h1>
			<div className="row wrap">
				<RecentFile name="Jack with Barista" isDarkTheme={props.isDarkTheme} link="screenplay"  type="Screenplay" id="hekfdr" />
				<RecentFile name="Jack with Barista" isDarkTheme={props.isDarkTheme} link="teleplay" type="Teleplay" id="kdefsd" />
				<RecentFile name="Jack's Adventures" isDarkTheme={props.isDarkTheme} link="series" type="Series" id="fedsfe" />
			</div>
        </div>
    );
}

export default Recent;