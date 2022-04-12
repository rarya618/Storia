import React from "react";
import { Link } from "react-router-dom";

// @ts-ignore
import { capitalize, getClassCode } from '../App';

type Props = {
    name: string,
    isDarkTheme: boolean,
    type: string,
    id: string
}

const RecentFile = (props: Props) => {
    var classCode = getClassCode("write", props.isDarkTheme);
    
    return (
        <Link to={"/write/" + props.id + "/" + props.name}>
            <div className={"box row no-select round-10px white " + classCode + "-color"}>
                <h4 className={"heading left " + classCode + "-color"}>{props.name}</h4>
                <span className={"label round-5px white-color absolute right " + classCode}>{capitalize(props.type)}</span>
            </div>
        </Link>
    );
}

export default RecentFile;