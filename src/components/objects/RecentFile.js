import { Link } from "react-router-dom";

// set class code
export function getClassCode(text) {
    switch (text.toLowerCase()) {
        case 'screenplay':
            return "green";
        
        case 'teleplay':
            return "brown";
        
        case 'series':
            return "purple";
    }

}

const RecentFile = props => {
    var classCode = getClassCode(props.type);
    
    return (
        <Link to={"/document/" + props.link + "/" + props.id + "/" + props.name}>
            <div 
                className={"box no-select round-10px white " + classCode + "-color"}>
                <div className={"preview " + classCode + "-color"}></div>
                <div className="row">
                    <h4 className={"heading left " + classCode + "-color"}>{props.name}</h4>
                    <span className={"label round-5px white-color absolute push-right right " + classCode}>{props.type}</span>
                </div>
            </div>
        </Link>
    );
}

export default RecentFile;