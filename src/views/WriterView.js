import { Link, useParams } from "react-router-dom";

import { getClassCode } from "../components/objects/RecentFile";

function WriterView() {
    let { documentType, documentId } = useParams();
    
    return (
        <>
        <div className={"title-bar menu no-select drag white " + getClassCode(documentType)}>
            <h1 className="heading title white-color">{documentType} View</h1>
        </div>
        <div className="container">
            <Link to="/">Home</Link>
        </div>
        </>
    )
}

export default WriterView;