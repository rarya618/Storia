import { Link, useParams } from "react-router-dom";

import Button from "../components/objects/Button";

import { getClassCode } from "../components/objects/RecentFile";

function counter(documentType) {
    var count = 0;
    var text = "words"

    if (documentType === "series") {
        text = "scripts";
    }

    return count.toString() + " " + text;
}

function timer() {
    return "0:00 / 0:00";
}

function WriterView() {
    let { documentType, documentId, documentName } = useParams();

    const color = getClassCode(documentType);

    return (
        <div className={"full-screen " + color + "-view"}>
            <div className={"title-bar no-select drag white " + color + "-color"}>
                <h1 className="heading title">{documentName} - {counter(documentType)}, {timer()}</h1>
            </div>
            <div className="menu white">
                <Link to="/">
                    <Button text="Home" color={color} />
                </Link>
                <Button text="Sidebar" color={color} />
                <Button text="Undo" color={color} />
                <Button text="Redo" color={color} />
                <Button text="Element" color={color} />
                <Button text={<strong>B</strong>} color={color} />
                <Button text={<i>I</i>} color={color} />
                <Button text={<u>U</u>} color={color} />
                <Button text="Find" color={color} />
                <Button text="Comment" color={color} />
            </div>
            <div className="container">
            </div>
        </div>
    )
}

export default WriterView;