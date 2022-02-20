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
    var classCode = getClassCode(capitalize(props.type), props.isDarkTheme);
    
    return (
        <Link to={"/document/" + props.type + "/" + props.id + "/" + props.name}>
            <div 
                className={"box no-select round-10px white " + classCode + "-color"}>
                <div className={"preview " + classCode + "-color"}></div>
                <div className="row">
                    <h4 className={"heading left " + classCode + "-color"}>{props.name}</h4>
                    <span className={"label round-5px white-color absolute push-right right " + classCode}>{capitalize(props.type)}</span>
                </div>
            </div>
        </Link>
    );
}

export default RecentFile;